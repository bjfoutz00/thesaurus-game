<template>
  <div v-if="leaderboardEntry.users">
    <p class="text-2xl">Leaderboard</p>
    <p class="italic">
      {{ leaderboardEntry.startWord }} &#10142; {{ leaderboardEntry.endWord }}
    </p>
    <ol class="list-decimal divide-y">
      <li v-for="player in leaderboardEntry.users" :key="player.name">
        <div class="flex flex-row justify-between py-1">
          <span>{{ player.name }}</span> <span>{{ player.score }}</span>
        </div>
      </li>
    </ol>
    <p v-if="leaderboard.length === 0" class="italic text-neutral-400">
      No one is on the leaderboard for this challenge yet...you could be the
      first!
    </p>
  </div>
</template>

<script>
export default {
  name: "LeaderBoard",
  computed: {
    leaderboard() {
      if (this.leaderboardEntry.users) {
        let leaderboard = this.leaderboardEntry.users;
        return leaderboard.sort((a, b) => {
          return a.score - b.score;
        });
      }
      return [];
    },
  },
  props: {
    leaderboardEntry: Object,
  },
};
</script>

<style></style>
