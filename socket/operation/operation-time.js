const cron = require("node-cron");
const {
  convertToMinutes,
  convertToMinutesByDate,
  getDayDifference,
  isMinutesRemaining,
  addMinutesToTime,
  subMinutesToTime,
  isOneHourDifference,
  getMinutesRemaining,
} = require("../../helper/date-helper");
const { modelList } = require("../../model/model");
const { fiveMinutesInterval } = require("./operation-time-services");

let isOperating = false;
let cronJob = null;

let timeStart = null;
let timeEnd = null;
let lastCashfund = null;
let timeInterval = null;
let isExtended = null;
let timeExtension = null;

let intervalId;

const cancelTimer = () => {
  clearInterval(intervalId);
  isOperating = false;
};

const notificationTimer = async (ws, payload) => {
  if (isOperating) return;

  isOperating = true;

  ({
    timeStart,
    timeEnd,
    lastCashfund,
    timeInterval,
    isExtended,
    timeExtension,
  } = await getConfig());
  let currentEndTime = isExtended ? timeExtension : timeEnd;
  let isCountdownRunning = false;
  // Get the syspar
  intervalId = setInterval(async () => {
    if (payload.type == "Operation") {
      currentEndTime = isExtended ? timeExtension : timeEnd;

      const totalSeconds = Math.floor(
        getMinutesRemaining(currentEndTime) / 1000
      );
      const hours = Math.floor(totalSeconds / 60 / 60);
      const minutesHehe = Math.floor(totalSeconds / 60);
      const minutes = Math.floor((totalSeconds / 60) % 60);
      const seconds = totalSeconds % 60;

      const formattedHours = hours < 10 ? `0${hours}` : hours;
      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      // console.log(
      //   `${formattedHours}:${formattedMinutes}:${formattedSeconds} hehe minutes ${minutesHehe}`
      // );

      ws.send(
        JSON.stringify({
          operationCountdown: `${formattedHours} hrs: ${formattedMinutes} mins: ${formattedSeconds} secs:` /*operationCountdownDialog: isCountdownRunning*/,
        })
      );

      if (minutesHehe < timeInterval && minutesHehe >= 0) {
        if (!isCountdownRunning) {
          ws.send(JSON.stringify({ operationCountdownDialog: true }));
          isCountdownRunning = true;
        }
        console.log("hellosss");
      } else {
        if (isCountdownRunning) {
          isCountdownRunning = false;
          ws.send(JSON.stringify({ operationCountdownDialog: false }));
          ({
            timeStart,
            timeEnd,
            lastCashfund,
            timeInterval,
            isExtended,
            timeExtension,
          } = await getConfig());

          if (minutes <= 0) {
            console.log("PUMASOK BA HERE???");
            ws.send(JSON.stringify({ isEnd: true }));
          }
        }

        // console.log("hehehe");
      }

      if (
        await isValid(
          timeStart,
          timeEnd,
          lastCashfund,
          15,
          timeExtension,
          isExtended
        )
      ) {
        if (!cronJob) {
          ws.send(JSON.stringify({ operationNotif: true }));

          ({
            timeStart,
            timeEnd,
            lastCashfund,
            timeInterval,
            isExtended,
            timeExtension,
          } = await getConfig());

          currentEndTime = isExtended ? timeExtension : timeEnd;
          console.log(currentEndTime);
          // const subtractMins = subMinutesToTime(currentEndTime, timeInterval);
          // const [hrs, mins] = subtractMins.split(':').map(Number)

          const [hrs, mins] = subMinutesToTime(currentEndTime, 15)
            .split(":")
            .map(Number);

          const { minutesArray, hoursArray } = fiveMinutesInterval(
            hrs + ":" + mins
          );

          console.log("Minutes array", minutesArray, "Hours Array", hoursArray);

          cronJob = cron.schedule(
            `${minutesArray.join(",")} ${hoursArray.join(",")} * * *`,
            async () => {
              ws.send(JSON.stringify({ operationNotif: true }));
            }
          );
        }
      } else {
        if (cronJob) {
          ({
            timeStart,
            timeEnd,
            lastCashfund,
            timeInterval,
            isExtended,
            timeExtension,
          } = await getConfig());
          cronJob.stop(); // Stop the cron job
          cronJob = null; // Clear the reference
        }
      }
    }

    if (payload.type == "ZReading") {
    }
  }, 1000);
};

const timeExtend = async (ws, payload) => {
  const syspar = modelList.systemparameters.instance.GetInstance();

  try {
    ({
      timeStart,
      timeEnd,
      lastCashfund,
      timeInterval,
      isExtended,
      timeExtension,
    } = await getConfig());

    let currentEndTime = isExtended ? timeExtension : timeEnd;

    const addMinutesToEndTime = addMinutesToTime(
      currentEndTime,
      payload.timeExtension
    );

    // Less than 1hr of start time
    if (isOneHourDifference(addMinutesToEndTime, timeStart)) {
      return ws.send(
        JSON.stringify({
          code: 400,
          message: "Failed. You are not allowed to add anymore",
        })
      );
    }

    const result = await syspar.update(
      {
        isextended: payload.isExtended,
        timeextension: addMinutesToEndTime,
      },
      {
        where: { recid: 1 },
      }
    );

    if (result[0] === 1) {
      ws.send(JSON.stringify({ code: 200, message: "Successfully updated" }));
      ws.send(JSON.stringify({ operationCountdownDialog: false }));

      ({
        timeStart,
        timeEnd,
        lastCashfund,
        timeInterval,
        isExtended,
        timeExtension,
      } = await getConfig());
      cronJob.stop(); // Stop the cron job
      cronJob = null; // Clear the reference
    } else {
      ws.send(JSON.stringify({ code: 400, message: "Request failed." }));
    }
  } catch (error) {
    console.log(error);
    ws.send(
      JSON.stringify({
        code: 400,
        message: "There is an error occured. Contact your POS Provider",
      })
    );
  }
};

const getConfig = async () => {
  const syspar = modelList.systemparameters.instance.GetInstance();
  const posfile = modelList.posfile.instance.GetInstance();

  const findSyspar = await syspar.findOne({});
  const lastCashfund = await posfile.findOne({
    where: { batchnum: "", postrntyp: "CASHFUND" },
    order: [["recid", "DESC"]],
  });

  return {
    timeStart: findSyspar.timestart,
    timeEnd: findSyspar.timeend,
    timeInterval: findSyspar.timeinterval,
    lastCashfund: lastCashfund,
    timeExtension: findSyspar.timeextension,
    isExtended: findSyspar.isextended,
  };
};

const isValid = async (
  timeStart,
  timeEnd,
  lastCashfund,
  timeInterval,
  timeExtension,
  isExtended
) => {
  const timeToday = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  let lastT = false;
  if (lastCashfund) {
    const lastCashfundDate = new Date(lastCashfund.trndte);
    const diffInDays = getDayDifference(lastCashfundDate);

    const startTime = convertToMinutes(timeStart);
    const endTime = convertToMinutes(timeEnd);
    const extensionTime = convertToMinutes(timeExtension || "00:00");
    const nowTime = convertToMinutes(timeToday);
    const extended = isExtended;

    let currentEndTime = extended ? extensionTime : endTime;
    let currentTimeEnd = extended ? timeExtension : timeEnd;

    const addMinutesToEndTime = addMinutesToTime(currentTimeEnd, 30);

    if (isOneHourDifference(addMinutesToEndTime, timeStart)) return false;
    if (diffInDays == 1) {
      if (
        (startTime > nowTime || currentEndTime > nowTime) &&
        isMinutesRemaining(currentTimeEnd, timeInterval)
      )
        lastT = true;
    } else {
      if (
        (startTime <= nowTime || currentEndTime <= nowTime) &&
        isMinutesRemaining(currentTimeEnd, timeInterval)
      )
        lastT = true;
    }

    if (diffInDays > 1) lastT = false;
  }
  return lastT;
};

module.exports = { notificationTimer, timeExtend, getConfig, cancelTimer };
