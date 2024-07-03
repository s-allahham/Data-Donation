let count = 0
const main = () => {
  ++count
  // Check if the current time is within a certain threshold of the alarm time
  const paramsFromLocation = new URLSearchParams(window.location.search);
  if (paramsFromLocation.get('myQuery')) {
    let dataArray = [];
    //getting the search query
    const querySearch = paramsFromLocation.get("q");
    const tbm = paramsFromLocation.get("tbm");
    if (tbm === "nws") {
      //google news query
      let links = document.querySelectorAll('a[jsname="YKoRaf"]');
      links.forEach((item) => {
        let url = new URL(item.href)
        url = `${url.origin}${url.pathname}`
        dataArray.push({
          url,
          heading: item.querySelector("div.n0jPhd.ynAwRc.nDgy9d").innerText,
          time_stamp: item.querySelector("div.OSrXXb.rbYSKb.LfVVr").innerText,
        });
      });
      dataArray = dataArray.slice(0, 10);
      if (dataArray.length <= 2) {
        if (count === 1) {
          main()
        }
      }
      chrome.runtime.sendMessage(
        { google_news_query: dataArray, querySearch },
        function () { }
      );
    } else if (!tbm) {
      //google query
      let links = document.querySelectorAll('a[jsname="UWckNb"]');
      links.forEach((item) => {
        let url = new URL(item.href)
        url = `${url.origin}${url.pathname}`
        dataArray.push({
          url,
          heading: item.querySelector("h3").innerText,
        });
      });
      dataArray = dataArray.slice(0, 10);
      if (document.querySelectorAll('div[jsname="xQjRM"]')) {
        links = document.querySelectorAll('div[jsname="xQjRM"]')
        links.forEach(item => {
          if (item.innerText.includes('Local news')) {
            item.querySelectorAll('a[jsname="YKoRaf"]').forEach(item => {
              let url = new URL(item.href)
              url = `${url.origin}${url.pathname}`
              dataArray.push({
                url,
                heading: item.querySelector('div[role="heading"]').innerText
              })
            })
          }
        })
      }
      if (dataArray.length <= 2 && count === 1) {
        main()
      }
      chrome.runtime.sendMessage(
        { google_query: dataArray, querySearch },
        function () { }
      );
    }
  }
}
main()
