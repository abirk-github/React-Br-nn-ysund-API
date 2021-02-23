import "./App.css";
import { useState, useEffect, useCallback } from "react";

const isNumeric = (str) => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};

const isOrganizationNumber = (input) => {
  const hasLengthOf9 = input && input.length === 9;
  return isNumeric(input) && hasLengthOf9;
}

function App() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const makeSearch = useCallback(() => {
    const isNotDefinedOrHasLength0 = !searchTerm;
    const isLessThanThreeLetters = searchTerm && searchTerm.length < 3;

    if (isNotDefinedOrHasLength0 || isLessThanThreeLetters) {
      return;
    }

    const url = isOrganizationNumber(searchTerm)
      ? `https://data.brreg.no/enhetsregisteret/api/enheter/${searchTerm}`
      : `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${searchTerm}`;

    setLoading(true);

    fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          setLoading(false);
          setItems(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setLoading(false);
          setError(error);
        }
      );
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      makeSearch();
    }, 1000);

    return () => clearTimeout(handler);
  }, [makeSearch]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const makeItem = (item) => (
    <div key={item.organisasjonsnummer}>
      <p>{item.navn}</p>
      <p>{item.organisasjonsnummer}</p>
      {item.konkurs && <p> KONKURS </p>}
    </div>
  );

  const Items = () => {
    if (items) {
      if (items._embedded && items._embedded.enheter) {
        return items._embedded.enheter.map(makeItem);
      }

      return makeItem(items);
    }
    return null;
  };

  if (error) {
    console.log(error);
  } else if (loading) {
    return <div>Loading...</div>;
  }

  //truthy = ['dgdfg'] , true, { slkfmksldmf: 'sdfs'}
  //falsy  = [], '', false, null, {},

  return (
    <div className="App">
      <input value={searchTerm} onChange={handleChange} />
      <Items />
    </div>
  );
}

export default App;
