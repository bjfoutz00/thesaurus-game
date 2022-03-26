<template>
  <div>
    <form @submit.prevent="sendWords">
      <label>Enter start word: </label>
      <input type="text" v-model="startWord" />
      <label>Enter end word: </label>
      <input type="text" v-model="endWord" />
      <input type="submit" value="Start" />
    </form>
  </div>
</template>

<script>
export default {
  name: "StartGame",
  data() {
    return {
      startWord: "",
      endWord: "",
    };
  },
  methods: {
    sendWords() {
      this.$emit("startWord", this.startWord);
      this.$emit("endWord", this.endWord);
    },
  },
};
</script>

<style>
</style>