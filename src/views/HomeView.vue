<template>
  <div class="m-auto max-w-4xl sm:mt-24">
    <!-- pre-game view -->
    <div class="mb-24 mx-10">
      <div v-if="!gameRunning" class="h-full">
        <div class="flex flex-col justify-center">
          <div class="mx-auto w-48 h-48 mb-8">
            <img src="../assets/tyrannosaurus.png" alt="thesaurus rex" />
          </div>
          <div>
            <button class="submitButton mx-1" @click="getDailyChallenge">
              Daily Challenge
            </button>
            <button class="submitButton mx-1" @click="getRandomWord">
              Random
            </button>
            <button class="submitButton mx-1 my-2" @click="toggleLdrbrds">
              Leaderboards
            </button>
          </div>
        </div>
      </div>
      <modal
        name="serverError"
        classes="bg-neutral-700 rounded-xl"
        width="80%"
        height="auto"
        :adaptive="true"
        :maxWidth="400"
      >
        <div class="h-full flex flex-col">
          <p class="my-auto justify-center">Could not connect to the server</p>
        </div>
      </modal>

      <div v-if="displayLdrbrds" class="flex flex-col">
        <div v-if="!showFullLeaderboard">
          <div
            class="flex justify-between border-2 border-neutral-500 mt-3 px-3 py-1 rounded-lg hover:bg-neutral-500 hover:cursor-pointer"
            v-for="boardHeader in leaderboards"
            :key="boardHeader._id"
            @click="displayFullLeaderboard(boardHeader)"
          >
            <p class="text-xl col-span-2 mt-1">
              {{ boardHeader.startWord }} <ArrowForwardIcon />
              {{ boardHeader.endWord }}
            </p>
            <p class="mr-2 flex-grow-0">
              <span class="font-bold text-neutral-600 w-10 mr-2">best</span>
              <span class="text-3xl w-10">{{ getHighScore(boardHeader) }}</span>
            </p>
          </div>
        </div>
        <div v-else>
          <LeaderBoard :leaderboardEntry="leaderboardEntry" />
          <button
            class="submitButton mx-1 my-2"
            @click="
              playChallenge(
                leaderboardEntry.startWord,
                leaderboardEntry.endWord
              )
            "
          >
            Play Challenge
          </button>
        </div>
      </div>
      <!-- game view -->
      <div v-if="!endWordFound && gameRunning">
        <div
          class="mb-2 mt-4 pb-2 flex justify-between border-b-2 border-neutral-300"
        >
          <p class="mx-4">
            <span class="font-bold text-neutral-500">start: </span
            ><span class="uppercase text-xl">{{ startWord }}</span>
          </p>
          <p class="mx-4">
            <span class="font-bold text-neutral-500">goal: </span
            ><span class="uppercase text-xl">{{ endWord }}</span>
          </p>
        </div>
        <div class="flex justify-between">
          <p class="mx-4">
            <span class="font-bold text-neutral-500">current: </span>
            <span class="uppercase text-2xl">{{ currentWord }}</span>
          </p>
          <p class="mx-4">
            <span class="font-bold text-neutral-500">score: </span>
            <span class="uppercase text-2xl">{{ numClicks }}</span>
          </p>
        </div>
        <p class="mt-4 pb-2 mb-2 border-b-2 border-neutral-300">
          <button
            @click.prevent="getSynonyms(word)"
            v-for="word in sortedSynonyms"
            :key="word"
            class="wordButton"
          >
            {{ word }}
          </button>
        </p>
        <form class="italic mt-4" @submit.prevent="startGame">
          <label>Feeling stuck? </label>
          <input
            type="submit"
            value="Restart"
            class="bg-teal-700 hover:bg-teal-500 hover:cursor-pointer mx-3 py-1 px-3 rounded-lg"
          />
        </form>
      </div>
      <!-- post-game view -->
      <div v-if="endWordFound">
        <h1 class="text-4xl italic">You win!</h1>
        <p class="bold text-xl">Score: {{ numClicks }}</p>
        <form
          v-if="!this.submittedName"
          class="mt-3 mb-6"
          @submit.prevent="submitToLdrbrd(playerName)"
        >
          <label class="text-left">Enter Player Name: </label>
          <div>
            <input
              class="py-[0.2rem] px-1 rounded-lg text-black"
              type="text"
              v-model="playerName"
            />
            <input
              type="submit"
              class="bg-neutral-600 px-3 mx-2 py-1 text-gray-100 rounded-lg font-semibold"
            />
          </div>
        </form>
        <LeaderBoard :leaderboardEntry="leaderboardEntry" />
        <button class="submitButton" @click="homeReset">Back Home</button>
      </div>
    </div>
  </div>
</template>

<script>
import LeaderBoard from "../components/LeaderBoard.vue";
import ArrowForwardIcon from "vue-material-design-icons/ArrowRight.vue";

export default {
  name: "HomeView",
  data() {
    return {
      startWord: "",
      endWord: "",
      currentWord: "",
      playerName: "",
      synonyms: Set,
      gameRunning: false,
      endWordFound: false,
      numClicks: 0,
      submittedName: false,
      leaderboardEntry: Object,
      displayLdrbrds: false,
      leaderboards: {},
      showFullLeaderboard: false,
    };
  },
  components: {
    LeaderBoard,
    ArrowForwardIcon,
  },
  computed: {
    sortedSynonyms() {
      let synArr = Array.from(this.synonyms);
      return synArr.sort();
    },
  },
  methods: {
    homeReset() {
      this.gameRunning = false;
      this.endWordFound = false;
      this.displayLdrbrds = false;
      this.startWord = "";
      this.endWord = "";
    },
    async startGame() {
      this.displayLdrbrds = false;
      await this.getSynonyms(this.startWord);
      this.gameRunning = true;
      this.numClicks = 0;
    },
    newGame() {
      this.gameRunning = false;
      this.numClicks = 0;
      this.startWord = "";
      this.endWord = "";
      this.currentWord = "";
    },
    playChallenge(startWord, endWord) {
      this.showFullLeaderboard = false;

      this.startWord = startWord;
      this.endWord = endWord;
      this.startGame();
    },
    toggleLdrbrds() {
      this.showFullLeaderboard = false;
      this.displayLdrbrds = true;
      if (this.displayLdrbrds) {
        this.getLdrbrds();
      }
    },
    getLdrbrds() {
      const url = `http://localhost:3000/allLeaderboards`;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.leaderboards = data;
        });
      this.displayLdrbrds = true;
    },
    displayFullLeaderboard(leaderboard) {
      this.leaderboardEntry = leaderboard;
      this.showFullLeaderboard = true;
    },
    getHighScore(leaderboard) {
      if (leaderboard.users.length === 0) {
        return "?";
      }
      return leaderboard.users.reduce((prev, curr) => {
        return curr.score < prev.score ? curr : prev;
      }).score;
    },
    submitToLdrbrd(playerName) {
      if (playerName === "") return;
      this.submittedName = true;
      const url = `http://localhost:3000/addUserScore`;
      fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startWord: this.startWord,
          endWord: this.endWord,
          username: playerName,
          score: this.numClicks,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.leaderboardEntry = data;
        });
    },
    async getSynonyms(word) {
      this.numClicks++;
      this.currentWord = word;
      if (word === this.endWord) {
        this.endWordFound = true;
        this.submittedName = false;
        this.loadLeaderboard();
        return;
      }
      const apiKey = "b559bc247d182feed8e5e15a4a035230";
      const url = `https://words.bighugelabs.com/api/2/${apiKey}/${word}/json`;

      fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.synonyms = new Set();
          console.log(data);
          let wordType = "adjective";

          if (data[wordType].syn) {
            data[wordType].syn.forEach((word) => {
              this.synonyms.add(word);
            });
          }

          if (data[wordType].sim) {
            data[wordType].sim.forEach((word) => {
              this.synonyms.add(word);
            });
          }
          if (data[wordType].rel) {
            data[wordType].rel.forEach((word) => {
              this.synonyms.add(word);
            });
          }

          console.log(this.synonyms);
        });
    },
    loadLeaderboard() {
      const url = `http://localhost:3000/getEntry/${this.startWord}/${this.endWord}`;
      fetch(url, {
        method: "GET",
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log("got the players");
          this.leaderboardEntry = data;
        });
    },
    updateCurrentWord(newWord) {
      this.currentWord = newWord;
    },
    getDailyChallenge() {
      const url = "http://localhost:3000/getDaily";
      fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.startWord = data.word;
          this.endWord = data.antonym;
          this.startGame();
        })
        .catch((error) => {
          console.log(error);
          this.$modal.show("serverError");
        });
    },
    getRandomWord() {
      const url = "http://localhost:3000/getRandom";
      fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.startWord = data.word;
          this.endWord = data.antonym;
          this.startGame();
        })
        .catch((error) => {
          console.log(error);
          this.$modal.show("serverError");
        });
    },
  },
};
</script>

<style>
svg {
  display: inline !important;
}
</style>
