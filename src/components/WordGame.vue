<template>
  <div>
    <p>{{ currentWord }}</p>
  </div>
</template>

<script>
export default {
  name: "WordGame",
  props: {
    startWord: String,
    endWord: String,
  },
  created() {
    this.updateCurrentWord(startWord);
  },

  data() {
    return {
      currentWord,
    };
  },

  methods: {
    updateCurrentWord(newWord) {
      this.currentWord = newWord;
    },
  },
};
</script>

<style>
</style>