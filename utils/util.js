const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 页面渲染完成后 调用
const down = (totalSecond,type)=> {
  // let totalSecond = time - Date.parse(new Date())/1000;
    // 秒数
    let second = totalSecond/1000;

    // 天数位
    let day = Math.floor(second / 3600 / 24);
    let dayStr = day.toString();
    // if (dayStr.length == 1) dayStr = '0' + dayStr;
    // 小时位
    let hr = Math.floor((second - day * 3600 * 24) / 3600);
    let hrStr;
    // if (day > 0) hrStr =(day * 24 + hr).toString();
    // else  hrStr = hr.toString();
      hrStr = hr.toString();
    if (hrStr.length == 1) hrStr = '0' + hrStr;

    // 分钟位
    let min = Math.floor((second - day * 3600 *24 - hr * 3600) / 60);
    let minStr = min.toString();
    if (minStr.length == 1) minStr = '0' + minStr;

    // 秒位
    var sec = second - day * 3600 * 24 - hr * 3600 - min*60;
    sec = parseInt(sec)
    var secStr = sec.toString();
    if (secStr.length == 1) secStr = '0' + secStr;

  if (type == "shi") hrStr = hr + (day*24);

    let obj = { dayStr, hrStr, minStr, secStr, totalSecond }
    return obj;

}

module.exports = {
  formatTime,
  down
}
