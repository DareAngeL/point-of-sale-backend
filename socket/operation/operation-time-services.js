const fiveMinutesInterval = (time) => {

    let [startHour, startMinute] = time.split(":").map(Number);

    let minutesArray = [];
    let hoursArray = [startHour];

    for(let i =1; i<=3; i++){

        let tempMins = startMinute + (i * 5) % 60;

        if (startMinute + (i * 5) >= 60) {
            tempMins = tempMins % 60;
            startHour = (startHour + 1) % 24; // Move to the next hour
            hoursArray.push(startHour);
        }
      
        minutesArray.push(tempMins);

    }

    let uniqueHours = [...new Set(hoursArray)];

    return {
        minutesArray:minutesArray,
        hoursArray: uniqueHours
    }
};

module.exports = {
    fiveMinutesInterval
}