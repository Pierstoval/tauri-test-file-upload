
<template>
  <h1>Print test</h1>
  <table>
    <thead>
      <tr>
        <td>#</td>
        <td>Field name</td>
        <td>Value</td>
        <td class="hide-print">Actions</td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="i in 150" :key="i">
        <td>{{ i }}</td>
        <td>Field number #{{ i }}</td>
        <td>{{ Math.ceil(Math.random()*1500)-500 }}</td>
        <td class="hide-print">
          <button>Edit</button>
          <button v-if="(Math.ceil(Math.random()*1500)*10) % 3 === 0">delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
  table, tr, td {
    border: 0 transparent;
    padding: 0;
    margin: 0;
    border-spacing : 0;
    border-collapse : collapse;
  }
  td {
    border: solid 1px #999;
    padding: 2px 5px;
  }
  button {
    display: inline-block;
    margin: 0 2px;
  }
</style>

<style>

@page {
  size: A4;
  margin: 0;
}

@media print {
  body {
    width: 21cm !important;
    height: 297mm !important;
    overflow-y: visible;
    overflow-x: hidden;
  }

  .hide-print {
    display: none !important;
  }

  nav {
    display: none !important;
  }
}
</style>