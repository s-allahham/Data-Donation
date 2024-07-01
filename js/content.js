let count=1
const main=()=>{
  ++count
  const now = new Date();
  const hours = now.getHours();
const minutes = now.getMinutes();
// Check if the current time is within a certain threshold of the alarm time
if (
  (hours === 12 && minutes === 0) ||
  (hours === 16 && minutes === 0) ||
  (hours === 20 && minutes === 0)
) {
  let dataArray = [];
  //getting the search query
  const paramsFromLocation = new URLSearchParams(window.location.search);
  const querySearch = paramsFromLocation.get("q");
  const tbm = paramsFromLocation.get("tbm");
  if (tbm === "nws") {
    //google news query
    let links = document.querySelectorAll('a[jsname="YKoRaf"]');
    links.forEach((item) => {
      let url=new URL(item.href)
      url=`${url.origin}${url.pathname}`
      dataArray.push({
        url,
        heading: item.querySelector("div.n0jPhd.ynAwRc.nDgy9d").innerText,
        time_stamp: item.querySelector("div.OSrXXb.rbYSKb.LfVVr").innerText,
      });
    });
    dataArray = dataArray.slice(0, 10);
    if(dataArray.length<=2){
      if(count===1){
        main()
      }
    }
       chrome.runtime.sendMessage(
        { google_news_query: dataArray, querySearch },
        function () {}
      );
  } else if (!tbm) {
    //google query
    let links = document.querySelectorAll('a[jsname="UWckNb"]');
    links.forEach((item) => {
      dataArray.push({
        url: item.href,
        heading: item.querySelector("h3").innerText,
      });
    });
    dataArray = dataArray.slice(0, 10);
    if(document.querySelectorAll('div[jsname="xQjRM"]')){
      links=document.querySelectorAll('div[jsname="xQjRM"]')
      links.forEach(item=>{
        if( item.innerText.includes('Local news')){
          item.querySelectorAll('a[jsname="YKoRaf"]').forEach(item=>{
            dataArray.push({
              url:item.href,
              heading:item.querySelector('div[role="heading"]').innerText
            })
          })
        }
      })
    }
    if(dataArray.length<=2 && count===2){
        main()
    }
       chrome.runtime.sendMessage(
        { google_query: dataArray, querySearch },
        function () {}
      );
  }
}
}
main()