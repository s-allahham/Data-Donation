let count=1;
//fucntion to get summary of the data
const getSummary=async(q)=>{
  try{
    const response=await fetch(`https://data-getter.onrender.com/data/summary?q=${q}`)
    const data=await response.json()
    document.getElementById('summary').innerHTML=`The link: "${q}" is repeated ${data.locationArraySummary.map(item=>{
      return `<b>${item.count}</b> times in <b>${item.location}</b> ` 
    })} and ${data.languageArraySummary.map(item=>{
      return `<b>${item.count}</b> times in browser with language setting <b>${item.language}</b> ` 
    })} and ${data.plugin_idArraySummary.map(item=>{
      return `<b>${item.count}</b> times to user <b>${item.plugin_id}</b> ` 
    })} and ${data.dateArraySummary.map(item=>{
      return `<b>${item.count}</b> times at <b>${item.date}</b> ` 
    })}`
  }catch(err){
    alert('something went wrong')
    console.log(err)
  }
}
//function to add common data table
const commonUrlDataAdder=async(q)=>{
  try{
    const response =await fetch(`https://data-getter.onrender.com/data/common?q=${q}`)
    const data=await response.json()
    const tableBody = document.querySelector('#urlTable tbody');
tableBody.innerHTML=''
        // Populate the table rows
        data.google.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="bl">Google</td>
                <td>${entry.url}</td>
                <td>${entry.count}</td>
            `;
            tableBody.appendChild(row);
        });

        data.google_news.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="bl">Google News</td>
                <td>${entry.url}</td>
                <td>${entry.count}</td>
            `;
            tableBody.appendChild(row);
        });
  }catch(err){
    alert('something went wrong')
    console.log(err)
  }
}
//fucntin to add unique option
function addUniqueOption(selectId, value) {
  const select = document.getElementById(selectId)
  const existingOption = Array.from(select.options).find(
    (opt) => opt.value === value
  )
  if (!existingOption) {
    const newOption = new Option(value, value)
    select.appendChild(newOption)
  }
}
//function to create tabel row
function createTableRow(item) {
  const { language, location, date, plugin_id } = item

  // Check if the option already exists before adding it

  addUniqueOption("language", language)
  addUniqueOption("date", date)
  addUniqueOption("plugin_id", plugin_id)
  addUniqueOption("location", location)
  //creating data row
  const row = document.createElement("tr")
  const thead=document.querySelector('thead tr')
  thead.innerHTML='<th>User ID</th><th>Location</th><th>Date</th><th>Language</th>'
  row.innerHTML = `
        <td>${plugin_id}</td>
        <td>${location}</td>
        <td>${date}</td>
        <td>${language}</td>
        ${item.query.map(result=>{
          thead.innerHTML+=`<th>Search Query</th><th>Google</th><th>Google News</th>`
          return ( `<td>${result.querySearch}</td>
          <td>${renderGoogleData(result.google_query)}</td>
          <td>${renderGoogleNewsData(result.google_news_query)}</td>`)
        }).join("")}
    `
  return row
}

function renderGoogleData(googleArray) {
  // Assuming each item in googleArray has a 'url' property
  return googleArray
    .map((item) => `<a href="${item.url}">${item.heading}</a>`)
    .join("<hr>")
}

function renderGoogleNewsData(googleNewsArray) {
  // Assuming each item in googleNewsArray has 'url' and 'heading' properties
  return googleNewsArray
    .map((item) => `<a href="${item.url}">${item.heading}</a>`)
    .join("<hr>")
}
//filtering elements
const form = document.getElementById("filterForm")
form.onsubmit = async (e) => {
  try {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(form))
    const response = await fetch("https://data-getter.onrender.com/data/filter", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
    const data = await response.json()
    if(count===1){
      ++count
      commonUrlDataAdder(data[0].query[0].querySearch)
      getSummary(data[0].query[0].google_query[0].url)
    }
    const tableBody = document.querySelector("#filter-table tbody")
    tableBody.innerHTML = ""
    document.getElementById(
      "filter-caption"
    ).innerText = `Items: ${data.length}`
    data.forEach((item) => {
      const row = createTableRow(item)
      tableBody.appendChild(row)
    })
  } catch (err) {
    console.log(err)
    alert("something went wrong!")
  }
}
//url form handler
const urlForm=document.getElementById('urlForm')
urlForm.addEventListener('submit',(e)=>{
  e.preventDefault()
  const {q} = Object.fromEntries(new FormData(urlForm))
  commonUrlDataAdder(q)
})
//summmary form handler
const summaryForm=document.getElementById('summaryForm')
summaryForm.addEventListener('submit',(e)=>{
  e.preventDefault()
  const {q} = Object.fromEntries(new FormData(summaryForm))
  getSummary(q)
})
document.querySelector('button').click()