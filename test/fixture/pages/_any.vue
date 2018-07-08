<template>
<div class="container">
  <h3>Variants: </h3>
  <table>
    <thead>
      <tr>
        <th v-for="heading in variantHeadings">
          {{ heading }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(variant, index) in $exp.variants">
        <td>{{ index + 1 }}</td>
        <td>{{ variant.weight }}</td>
      </tr>
    </tbody>
  </table>
  <h3>Active Variants: </h3>
  <table>
    <thead>
    <tr>
      <th v-for="heading in variantHeadings">
        {{ heading }}
      </th>
    </tr>
    </thead>
    <tbody>
      <tr v-for="(variant, index) in $exp.$activeVariants">
        <td>{{ index + 1 }}</td>
        <td>{{ variant.weight }}</td>
      </tr>
    </tbody>
  </table>
  <h3>Active Classes: </h3>
  <table>
    <thead>
      <tr>
        <th v-for="heading in classNameHeadings">
          {{ heading }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(className, index) in $exp.$classes">
        <td>{{ index + 1 }}</td>
        <td>{{ className }}</td>
      </tr>
    </tbody>
  </table>
  <h3>Experiment Index: </h3>
  <div>
    {{ $exp.$experimentIndex }}
  </div>
  <h3>Experiment ID: </h3>
  <div>
    {{ $exp.experimentID }}
  </div>
  <h3>Max Age: </h3>
  <div>
    {{ $exp.maxAge }}
  </div>
  <h3>Name: </h3>
  <div>
    {{ $exp.name }}
  </div>
  <h3>Sections: </h3>
  <div>
    {{ $exp.sections }}
  </div>
  <div class="button-container">
    <button @click="wheelOfFortune">Click Here To Test Your Luck!</button>
  </div>
</div>
</template>

<script>
// Utils
import { deleteAllCookies } from '~/scripts/utils';

export default {
  data() {
    return {
      variantHeadings: [ 'Row', 'Weight' ],
      classNameHeadings: [ 'Row', 'Class Name' ],
    }
  },
  methods: {
    wheelOfFortune() {
      deleteAllCookies();
      window.location.reload();
    }
  }
}
</script>

<style>
  .container {
    background-color: #f7f8fb;
    padding: 20px;
    width: 400px;
  }
  table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }

  td, th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
  }

  tr:nth-child(even) {
    background-color: #dddddd;
  }
  .button-container {
    display: flex;
    justify-content: center;
  }
  button {
    background-color: #4CAF50; /* Green */
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    -webkit-transition-duration: 0.4s; /* Safari */
    transition-duration: 0.4s;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
  }
</style>
