function arraysMatch(arr1, arr2) {
  if (!Array.isArray(arr1)) {
    throw "Arg 1 not an array";
  }
  if (!Array.isArray(arr2)) {
    throw "Arg 2 not an array";
  }
  if (arr1.length !== arr2.length) {
    throw "Arrays are not the same length " + arr1.length + " vs " + arr2.length;
  }

  arr1.forEach(item => {
    if (!arr2.find(val => val === item)) {
      throw item + " not found in array 2";
    }
  });

  expect(1).toBe(1);
}

module.exports = {
  arraysMatch
};
