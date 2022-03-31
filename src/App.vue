<template>
  <div id="app" class="h-screen flex flex-col">
    <div class="bg-teal-500 py-2 flex justify-between px-3">
      <p @click="$router.go()" class="text-2xl font-bold hover:cursor-pointer">
        Thesaurdle
      </p>
      <button @click="showInfoModal" class="p-1 rounded-lg">
        <InfoIcon :size="24" />
      </button>
    </div>
    <modal
      name="infoModal"
      width="80%"
      height="auto"
      :adaptive="true"
      :maxWidth="400"
    >
      <div class="m-3 text-left text-black">
        <p class="text-xl italic">
          Get to the antonym in as few steps as possible.
        </p>
        <p class="mt-3">
          Only the synonyms of the current word will be displayed. Clicking on a
          synonym displays the synonyms for that word. Clicking on the end word
          wins you the game. Can you beat the high score?
        </p>
      </div>
    </modal>
    <router-view class="mb-auto w-[100%]" />
    <div class="grid grid-cols-4 border-t-slate-300 border-t-2 py-1.5">
      <span class="font-medium">BJ Foutz</span>
      <a
        class="font-semibold underline"
        href="https://github.com/bjfoutz00/thesaurus-game.git"
        >Github: Front End</a
      >
      <a
        class="font-semibold underline"
        href="https://github.com/jaredblack/thesaurus-backend.git"
        >Github: Back End</a
      >
      <span class="font-medium">Jared Black</span>
    </div>
  </div>
</template>

<script>
import InfoIcon from "vue-material-design-icons/Information.vue";

export default {
  components: {
    InfoIcon,
  },
  methods: {
    showInfoModal() {
      this.$modal.show("infoModal");
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
