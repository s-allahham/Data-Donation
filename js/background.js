//Array for setting up alarms
const alarmArray = [12, 0, 16, 0, 20, 0];

//Array containing searchQueries for alarm
const searchTermsforAlarm = [
  "Probleme der Einwanderer",
  "illegale Einwanderung",
  "Soziale Integration von Einwanderern",
  "Einwanderung und Kriminalitätsrate",
  "Politische Reaktionen auf den Klimawandel",
  "Auswirkungen des Klimawandels",
  "Klimawandel und Entwaldung",
  "Auswirkungen des Klimawandels auf die biologische Vielfalt",
  "AFD",
  "CDU",
  "Die Linke",
  "Die Grünen",
];

let sending = false;

//function to get formatted date in format month-day, hours:minutes
const getFormattedDate = () => {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1; // Adding 1 to match human-readable month
  const day = currentDate.getDate();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const year = currentDate.getFullYear();
  return `${month}/${day}/${year}, ${hours}:${minutes}`;
};
// This event is fired when the browser starts up
chrome.runtime.onStartup.addListener(() => {
  setId();
  setupDailyAlarms();
});

// This event is fired when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  setId();
  setupDailyAlarms();
});

//function to set id
const setId = () => {
  chrome.storage.local.get(["plugin_id"], async (id) => {
    try {
      const pluginId = id.plugin_id;
      if (!pluginId) {
        const response = await fetch(
          "https://data-getter.onrender.com/user/set"
        );
        const { plugin_id } = await response.json();
        chrome.storage.local.set({ plugin_id });
      }
    } catch (err) {
      console.log(err);
    }
  });
};

//function to set daily alarm
function setupDailyAlarms() {
  // Check if the first alarm exists
  chrome.alarms.get("alarmOne", (alarm) => {
    setDailyAlarm("alarmOne", alarmArray[0], alarmArray[1]);
  });

  // Check if the second alarm exists
  chrome.alarms.get("alarmTwo", (alarm) => {
    setDailyAlarm("alarmTwo", alarmArray[2], alarmArray[3]);
  });
  // Check if the third alarm exists
  chrome.alarms.get("alarmThree", (alarm) => {
    // Set the third alarm for another specific time, e.g., 09:00
    setDailyAlarm("alarmThree", alarmArray[4], alarmArray[5]);
  });
}

function setDailyAlarm(alarmName, hours, minutes) {
  const now = new Date();
  const targetTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );
  let delayInMilliseconds = targetTime.getTime() - now.getTime();

  // If the target time has already passed today, set it for tomorrow
  if (delayInMilliseconds < 0) {
    delayInMilliseconds += 86400000; // Add 24 hours in milliseconds
  }

  chrome.alarms.create(alarmName, {
    when: Date.now() + delayInMilliseconds,
    periodInMinutes: 1440, // Set it to repeat every day (1440 minutes in a day)
  });
}
// Listen for the alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  // Check if the current time is within a certain threshold of the alarm time
  if (
    (alarm.name === "alarmOne" &&
      hours === alarmArray[0] &&
      minutes === alarmArray[1]) ||
    (alarm.name === "alarmTwo" &&
      hours === alarmArray[2] &&
      minutes === alarmArray[3]) ||
    (alarm.name === "alarmThree" &&
      hours === alarmArray[4] &&
      minutes === alarmArray[5])
  ) {
    // Perform your action here
    searchTermsforAlarm.map((item) => {
      chrome.tabs.create({ url: `https://www.google.com/search?q=${item}` });
      chrome.tabs.create({
        url: `https://www.google.com/search?q=${item}&tbm=nws`,
      });
    });
  }
});
//function to get location
const getLocation = async () => {
  const response = await fetch("http://ip-api.com/json/?fields=city");
  const data = await response.json();
  return data.city;
};
//initializing the main data object
let data = {
  query: [{ querySearch: "", google_query: [], google_news_query: [] }],
};
let toggleCompleteState = false;


//<------------Receiving messages from content------------>
chrome.runtime.onMessage.addListener(async (message, sender, response) => {
  try {
    const { google_query, google_news_query, querySearch } = message;
    const existingQueryIndex = data.query.findIndex(
      (q) => q.querySearch === querySearch
    );

    if (querySearch) {
      chrome.tabs.remove(sender.tab.id, () => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        }
      });
    }
    if (existingQueryIndex !== -1) {
      toggleCompleteState = true;
      if (google_news_query) {
        data.query[existingQueryIndex].google_news_query = google_news_query;
      } else if (google_query) {
        data.query[existingQueryIndex].google_query = google_query;
      }
    } else if (!data.query[0].querySearch) {
      data.query[0].google_news_query = google_news_query;
      data.query[0].google_query = google_query;
      data.query[0].querySearch = querySearch;
    } else {
      toggleCompleteState = false;
      data.query.push(message);
    }

    // checking if the data is stored
    if (
      data.query.length === searchTermsforAlarm.length &&
      toggleCompleteState
    ) {

      
      //plugin_id
      let result = await chrome.storage.local.get(["plugin_id"]);
      data = { ...data, plugin_id: result.plugin_id };

      if (sending) return;    
      sending = true;  

      //location
      const location = await getLocation();
      data = { ...data, location };
      //get time
      let date = getFormattedDate();
      data = { ...data, date };
      //getting language
      const language = await navigator.language;
      data = { ...data, language };

      if (!("plugin_id" in data)) return;      

      
      const response = await fetch("https://data-getter.onrender.com/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const dataResponse = await response;
      console.log(data);
      sending = false;
      data = {
        query: [{ querySearch: "", google_query: [], google_news_query: [] }],
      };
    }
  } catch (err) {
    console.log(err);
  }
});
//script to open dashboard
let count = 0;
chrome.commands.onCommand.addListener((command) => {
  if (command === "open Dashboard") {
    ++count;
    if (count === 3) {
      count = 0;

      chrome.windows.create({
        url: "../html/dashboard.html",
      });
    }
  }
});

const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();