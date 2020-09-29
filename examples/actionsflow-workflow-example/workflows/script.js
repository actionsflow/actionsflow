module.exports = async function ({ helpers }) {
  const result = await helpers.axios.get(
    "https://jsonplaceholder.typicode.com/posts"
  );
  return {
    items: result.data,
  };
};
