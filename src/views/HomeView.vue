<template>
  <div class="home">
    <form @submit.prevent="startGame">
      <label>Enter start word: </label>
      <input type="text" v-model="startWord" />
      <label>Enter end word: </label>
      <input type="text" v-model="endWord" />
      <input type="submit" value="Start" />
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HomeView",
  data() {
    return {
      startWord: "",
      endWord: "",
      currentWord: "",
      synonyms: [],
    };
  },
  methods: {
    startGame() {
      this.updateCurrentWord(this.startWord);
      this.getSynonyms(this.currentWord);
    },
    async getSynonyms() {
      const apiKey = "02faeac6-c0bc-4910-a555-88dbd7edca6c";
      const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${this.currentWord}?key=${apiKey}`;
      await axios.get(url).then((response) => {
        console.log(Array.isArray(response.data));
        console.log(response.data);
        this.synonyms = [];
        for (let i = 0; i < response.data.length; i++) {
          let syn_list = response.data[i].def[0].sseq[0][0][1].syn_list;
          let rel_list = response.data[i].def[0].sseq[0][0][1].rel_list;

          for (let list of syn_list) {
            for (let wd_obj of list) {
              for (let word of Object.values(wd_obj)) {
                this.synonyms.push(word);
              }
            }
          }
          for (let list of rel_list) {
            for (let wd_obj of list) {
              for (let word of Object.values(wd_obj)) {
                this.synonyms.push(word);
              }
            }
          }
        }
        console.log(this.synonyms);
      });
    },

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
