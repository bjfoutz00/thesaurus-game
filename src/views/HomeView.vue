<template>
  <div class="m-auto">
    <!-- pre-game view -->
    <div v-if="!gameRunning">
      <div>
        <button class="submitButton" @click="getDailyChallenge">
          Daily Challenge
        </button>
        <button class="submitButton" @click="getRandomWord">Random</button>
      </div>
      <div class="mx-10 mt-10">
        <p>Your goal: Get from the start word to the end word.</p>
        <p>
          Only the synonyms of the current word will be displayed. Clicking on a
          synonym takes you to more synonyms. Clicking on the end word wins you
          the game. Can you beat the high score?
        </p>
      </div>
    </div>

    <!-- game view -->
    <div v-if="!endWordFound && gameRunning">
      <div>
        <span class="mx-4">Start word: {{ startWord }}</span>
        <span class="mx-4">End word: {{ endWord }}</span>
        <p>Current word: {{ currentWord }}</p>
      </div>
      <p>
        <button
          @click.prevent="getSynonyms(word)"
          v-for="word in sortedSynonyms"
          :key="word"
          class="wordButton"
        >
          {{ word }}
        </button>
      </p>
      <p>Score: {{ numClicks }}</p>

      <form @submit.prevent="newGame">
        <label>Feeling stuck?</label>
        <input type="submit" value="GIVE UP" />
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
        });
    },
    getRandomWord() {},
    shuffle(array) {
      let currentIndex = array.length,
        randomIndex;

      // While there remain elements to shuffle...
      while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }

      return array;
    },
  },
};
</script>
