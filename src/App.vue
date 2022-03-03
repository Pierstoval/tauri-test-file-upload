<script>
import DragDrop from './components/DragDrop.vue';
import PrintExample from './components/PrintExample.vue';
import NotFound from './components/NotFound.vue';

const routes = {
  '/': DragDrop,
  '/print': PrintExample
}

export default {
  name: 'App',
  data() {
    return {
      currentPath: window.location.hash
    }
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1) || '/'] || NotFound
    }
  },
  mounted() {
    window.addEventListener('hashchange', () => {
      this.currentPath = window.location.hash
    })
  }
}
</script>

<template>

  <div id="main">
    <nav>
      <ul>
        <li><a href="#/">Drag&Drop</a></li>
        <li><a href="#/print">Print test</a></li>
      </ul>
    </nav>
    <component :is="currentView" />
  </div>

</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Calibri", sans-serif;
}
</style>

<style scoped>
#main {
  width: 50%;
  min-width: 600px;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 50px 10px 50px;
}
ul { list-style: none; }
li, a { display: inline-block; }
a { padding: 5px; margin: 2px; border: solid 1px #aaf; border-radius: 5px; color: #000; background-color: #ccf }
a:hover { background-color: #ddf; }
</style>