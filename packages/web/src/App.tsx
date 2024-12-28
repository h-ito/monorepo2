export const App = () => {
  const handleClick = async () => {
    console.log("called");
    const response = await fetch("http://127.0.0.1:3000/api");
    const json = await response.json();
    console.log(json.data[0]);
  };

  return (
    <>
      <div>
        <button onClick={handleClick}>Button</button>
      </div>
    </>
  );
};
