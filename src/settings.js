let preferLookup = false;

const setPreferLookup = val => (preferLookup = val);
const getPreferLookup = () => preferLookup;

export default {
  setPreferLookup,
  getPreferLookup
};
