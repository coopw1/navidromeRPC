import { Client } from "@xhayper/discord-rpc";
import axios from "axios";

// Set this to your  Client ID.
const clientId = process.env.CLIENT_ID;

const rpc = new Client({
  clientId: clientId,
});

async function getNavidromedata() {
  const URL =
    "http://localhost:4536/rest/getNowPlaying?u=april&p=3lYyVj^%25cUf6P%26%23T&f=json&v=1.13.0&c=navicord";

  const response = await axios.get(URL);

  // console.log(response.data["subsonic-response"].nowPlaying);

  return response.data["subsonic-response"].nowPlaying;
}

async function getReleaseID(title, artist, album) {
  const URL = "http://musicbrainz.org/ws/2/release/";

  const PARAMS = {
    headers: {
      "User-Agent": `NavidromeRPC/1.0.0 (coopwd@proton.me)`,
    },
    params: {
      query: "artist:" + artist + " release:" + album + " title:" + title,
      fmt: "json",
    },
  };

  const response = await axios.get(URL, PARAMS);
  return response.data.releases[0]["release-group"].id;
}

rpc.on("ready", async function () {
  let savedTitle = "";
  let savedID = "";
  let songStartTime;
  let songEndTime;
  // activity can only be set every 15 seconds
  setInterval(async () => {
    const listens = await getNavidromedata();
    // console.log(listens.entry[0]);
    if (typeof listens?.entry !== "undefined") {
      const song = listens.entry[0];

      // Check if the song title has changed
      if (song.title !== savedTitle) {
        const releaseID = await getReleaseID(
          song.title,
          song.displayArtist,
          song.album || ""
        ).catch((error) => {
          console.error("Error fetching release ID:", error);
        });
        songStartTime = Date.now();
        // Add duration in seconds
        songEndTime = songStartTime + song.duration * 1000;
        savedID = releaseID;
        console.log("Changing song time");
      }

      // console.log(listens);
      rpc?.user.setActivity({
        type: 2,
        details: song.title,
        state: `by ${song.displayArtist}`,
        largeImageText: song.album || "",
        smallImageKey: "logo",
        largeImageKey: `https://coverartarchive.org/release-group/${savedID}/front-500`,
        startTimestamp: songStartTime,
        endTimestamp: songEndTime,
      });

      savedTitle = song.title;
    } else {
      console.log(listens);
      console.log("No one is listening");
    }
  }, 1e3);
});

rpc.login().catch((Error) => {
  console.error(Error);
});
