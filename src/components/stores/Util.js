import moment from 'moment';

export function humanizeDate(rawDate) {
  const m  = new moment(rawDate);
  return m.format('DD-MMM-YYYY HH:mm:ss');
}

export function simpleDate(rawDate) {
  if(rawDate === undefined)
  {
    return rawDate;
  }
  const m  = new moment(rawDate);
  return m.format('DD-MMM-YYYY');
}


export function isBlank(str) {
  if(str==null)
  {
    return true;
  }
  return (!str || 0 === str.trim().length || /^\s*$/.test(str));
}

export function isArrayEmpty(arr){
  return (arr.constructor === Array && arr.length === 0)
}

export function isEmpty(obj){

  if(obj===undefined)
    return true;

  switch(obj.constructor){

    case (Array):{
      return (obj.length===0);
    }

    case (Object):{
      return (Object.entries(obj).length===0)
    }

    case (String):{
      return (obj.trim().length === 0)
    }

    default:
      return false;

  }

}

export function humanizeFileSize(size){

  let calculatedSize = size;

  switch(true){

    case (size>=1000*1000*1000): {
      calculatedSize = size/(1000*1000*1000);
      return Math.round(calculatedSize) + " Gb";
    }

    case (size>=1000*1000): {
      calculatedSize = size/(1000*1000);
      return Math.round(calculatedSize) + " Mb";
    }

    case (size>=1000): {
      calculatedSize = size/1000;
      return Math.round(calculatedSize) + " Kb";
    }

    case (size<1000): {
      calculatedSize = size;
      return Math.round(calculatedSize) + " bytes";
    }

    default:{
      return calculatedSize;
    }
  }

}

export function generateUniqueKey(){
    let unique_key = Math.random().toString(16).substring(2, 15) + "-" + Math.random().toString(16).substring(2, 15);
    return unique_key;
}

export function yesOrNo(value) {
  if (value==null)
  {
    return "No";
  }
  return value === true ? "Yes" : "No";
}
