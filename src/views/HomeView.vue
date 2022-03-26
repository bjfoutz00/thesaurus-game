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
          </div>
        </div>
      </div>
      <modal
        name="serverError"
        classes="bg-neutral-700 rounded-xl"
        width="80%"
        height="auto"
        adaptive="true"
        maxWidth="400"
      >
        <div class="h-full flex flex-col">
          <p class="my-auto justify-center">Could not connect to the server</p>
        </div>
      </modal>
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
          class="my-3"
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
        <p class="text-2xl">Leaderboard</p>
        <ol class="list-decimal divide-y">
          <li v-for="player in leaderboard" :key="player.name">
            <div class="flex flex-row justify-between py-1">
              <span>{{ player.name }}</span> <span>{{ player.score }}</span>
            </div>
          </li>
        </ol>
        <p v-if="players.length === 0" class="italic text-neutral-400">
          No one is on the leaderboard for this challenge yet...you could be the
          first!
        </p>
      </div>
    </div>
  </div>
</template>

<script>
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
      players: [
        { name: "shreklvr", score: 1 },
        { name: "jrdblck", score: 9000 },
        { name: "QueenOfEngland", score: 15 },
      ],
    };
  },

  computed: {
    leaderboard() {
      let leaderboard = this.players;
      return leaderboard.sort((a, b) => {
        return a.score - b.score;
      });
    },
    sortedSynonyms() {
      let synArr = Array.from(this.synonyms);
      return synArr.sort();
    },
  },
  methods: {
    async startGame() {
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
    submitToLdrbrd(playerName) {
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
          this.players = data.users;
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
          this.players = data.users;
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
