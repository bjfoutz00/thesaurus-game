<template>
  <div class="bg-neutral-800 text-white">
    <!-- pre-game view -->
    <div v-if="!gameRunning">
      <form class="pt-4 flex flex-col" @submit.prevent="startGame()">
        <div class="flex">
          <label class="">Enter start word: </label>
          <input class="inputText" type="text" v-model="startWord" />
        </div>
        <div class="flex">
          <label class="">Enter end word: </label>
          <input class="inputText" type="text" v-model="endWord" />
        </div>
        <input class="ml-4 submitButton" type="submit" value="START" />
      </form>
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
        <span>Start word: {{ startWord }}</span>
        <span>End word: {{ endWord }}</span>
        <p>Current word: {{ currentWord }}</p>
      </div>
      <p>
        <button
          @click.prevent="getSynonyms(word)"
          v-for="word in sortedSynonyms"
          :key="word"
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
      <h1>CONGRATULATIONS</h1>
      <p>Score: {{ numClicks }}</p>
      <form @submit.prevent="submitToLdrbrd(playerName)">
        <label>Enter Player Name: </label>
        <input type="text" v-model="playerName" />
        <input type="submit" />
      </form>
      <p>Leaderboard</p>
      <ol>
        <li v-for="player in leaderboard" :key="player">
          {{ player.name }}: {{ player.score }}
        </li>
      </ol>
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
      return Array.from(this.synonyms).sort();
    },
  },
  methods: {
    async startGame() {
      this.gameRunning = true;
      await this.getSynonyms(this.startWord);
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
      this.players.push({ name: playerName, score: this.numClicks });
    },
    async getSynonyms(word) {
      this.numClicks++;
      this.currentWord = word;
      if (word === this.endWord) {
        this.endWordFound = true;
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
          Object.keys(data).forEach((wordType) => {
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
          });
          console.log(this.synonyms);
        });
    },
    // async getSynonyms() {
    //   const apiKey = "02faeac6-c0bc-4910-a555-88dbd7edca6c";
    //   const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${this.currentWord}?key=${apiKey}`;
    //   let response = await fetch(url);
    //   let data = await response.json();
    //   let copiedData = [...data];
    //   console.log(Array.isArray(data));
    //   console.log(data);
    //   this.synonyms = [];
    //   copiedData.forEach((item) => {
    //     let syn_list = item.def[0].sseq[0][0][1].syn_list;
    //     let rel_list = item.def[0].sseq[0][0][1].rel_list;

    //     for (let list of syn_list) {
    //       for (let wd_obj of list) {
    //         for (let word of Object.values(wd_obj)) {
    //           this.synonyms.push(word);
    //         }
    //       }
    //     }
    //     for (let list of rel_list) {
    //       for (let wd_obj of list) {
    //         for (let word of Object.values(wd_obj)) {
    //           this.synonyms.push(word);
    //         }
    //       }
    //     }

    //     console.log(this.synonyms);
    //   });
    // },

    updateCurrentWord(newWord) {
      this.currentWord = newWord;
    },
    getStartWord(value) {
      console.log(value);
      this.startWord = value;
    },
    getEndWord(value) {
      console.log(value);
      this.endWord = value;
    },
  },
};
</script>
