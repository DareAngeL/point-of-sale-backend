
const { getMonth, getDate, format, addMinutes, subMinutes, addDays } = require("date-fns");
const { el } = require("date-fns/locale");

const getNumMonth = (date) => {
    const monthMapping = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];
    const monthNum = getMonth(date);
    return monthMapping[monthNum];
}

const getDayOfMonth = (date) => {
    return getDate(date);
}

const getDayDifference = (previousDate) => {
    const dateNow = new Date();
    
    // Set the time to midnight for both dates
    dateNow.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);

    // if(previousDate>dateNow)
    //     return 0;

    // Calculate the difference in milliseconds
    const diffInMs = Math.abs(dateNow - previousDate);
    
    // Convert milliseconds to days
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    return diffInDays;
}


// Always make sure that the parameter is always a Date object
const convertToMinutesByDate = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes(date);
    return hours * 60 + minutes;

}

const convertToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    
    
    return hours>=24?minutes:(hours * 60 + minutes)

}

const isMinutesRemaining = (targetTime, timeRemaining) =>{

    const now = new Date();

    const [hours, minutes] = targetTime.split(':').map(Number);

    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    const differenceInMs = target - now;

    const remainingTimeInMs = timeRemaining * 60 * 1000;

    return differenceInMs > 0 && differenceInMs <= remainingTimeInMs; 

}

const getMinutesRemaining = (targetTime) => {
    const now = new Date();
    let target = new Date();

    const [hours, minutes] = targetTime.split(':').map(Number);
    const currentHours = now.getHours();

    if(currentHours > hours){
        target = addDays(target, 1)
    }
    
    target.setHours(hours, minutes, 0, 0);

    return target - now;
}

const addMinutesToTime = (time, minutesToAdd) => {

    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    const newDate = addMinutes(date, minutesToAdd)

    return format(newDate, 'HH:mm')

}

const subMinutesToTime = (time, minutesToSub) => {
    
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    const newDate = addMinutes(date, -minutesToSub)

    console.log(newDate, time, hours, minutes, minutesToSub);

    return format(newDate, 'HH:mm')

}

const isOneHourDifference = (timeend, timestart) => {
    
    const [timeendHrs, timeendMins] = timeend.split(":").map(Number);
    const [timestartHrs, timestartMins] = timestart.split(":").map(Number);

    let timeendedMinutes = (timeendHrs * 60) + timeendMins;
    let timestartMinutes = (timestartHrs * 60) + timestartMins; 
    
    let differenceInMinutes = timeendedMinutes - timestartMinutes

    if(differenceInMinutes < 0){
        differenceInMinutes += (24*60)
        differenceInMinutes = 1440 - differenceInMinutes; 
    }

    return Math.abs(differenceInMinutes) < 60;
}

const isTimeBetween = (timeA, timeB, timeC) => {

}

const isNextDay = (newtime, timestart) => {
  if (newtime === "" || timestart === "") return false;

  const timeStartDate = new Date(`1970-01-01 ${timestart}`);
  const newDate = new Date(`1970-01-01 ${newtime}`);

  return newDate < timeStartDate;
}

const isAGreaterThanBMilTime = (timeA, timeB) => {
    const [timeAHrs, timeAMins, timeASec] = timeA.split(":").map(Number);
    const [timeBHrs, timeBMins, timeBSec] = timeB.split(":").map(Number);

    let timeASeconds = (timeAHrs * 60 * 60) + (timeAMins * 60) + timeASec;
    let timeBSeconds = (timeBHrs * 60 * 60) + (timeBMins * 60) + timeBSec;

    return timeASeconds > timeBSeconds;
}

module.exports = {
    getNumMonth,
    getDayOfMonth,
    getDayDifference,
    convertToMinutes,
    convertToMinutesByDate,
    isMinutesRemaining,
    addMinutesToTime,
    subMinutesToTime,
    isOneHourDifference,
    isTimeBetween,
    getMinutesRemaining,
    isNextDay,
    isAGreaterThanBMilTime
}