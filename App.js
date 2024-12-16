import { useEffect, useState } from "react";
import "./style.css";
import supabase from "./supabase";
import "./Loader.css";
// const initialFacts = [
//   {
//     id: 1,
//     fact: "React is being developed by Meta (formerly facebook)",
//     source: "https://opensource.fb.com/",
//     category: "technology",
//     Votes_interesting: 24,
//     Votes_mindblowing: 9,
//     Votes_falsefacts: 4,
//     createdIn: 2021,
//   },
//   {
//     id: 2,
//     fact: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
//     source:
//       "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
//     category: "society",
//     Votes_interesting: 11,
//     Votes_mindblowing: 2,
//     Votes_falsefacts: 0,
//     createdIn: 2019,
//   },
//   {
//     id: 3,
//     fact: "Lisbon is the capital of Portugal",
//     source: "https://en.wikipedia.org/wiki/Lisbon",
//     category: "society",
//     Votes_interesting: 8,
//     Votes_mindblowing: 3,
//     Votes_falsefacts: 1,
//     createdIn: 2015,
//   },
// ];

// for understanding the useState Counter function was created this is not an part of thi project
// function Counter() {
//   //const x=useState(8);
//   const [count, setCount] = useState(0); //destructuring

//   return (
//     <div>
//       <span style={{ fontSize: "40px" }}>{count}</span>
//       <button
//         className="button button-large"
//         onClick={() => setCount((count) => count + 1)} //here we use the callback function to update the count to count + 1 while clicking the button
//       >
//         +1
//       </button>
//     </div>
//   );
// }

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currcategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");
        if (currcategory !== "all") {
          query = query.eq("category", currcategory);
        }

        const { data: facts, error } = await query
          .order("Votes_Interesting", { ascending: false }) //to order the data of the table
          .limit(1000); //to limit to take only first 1000 rows of data from the table

        //error handling
        if (!error) {
          setFacts(facts);
        } else {
          alert("ERROR IN GETTING DATA");
        }
        setIsLoading(false);
      }
      getFacts();
    },
    [currcategory]
  );

  return (
    <>
      {/* In the below line we pass the props for the child component Header */}
      <Header showForm={showForm} setShowForm={setShowForm} />
      {/* The line 76 is deciding whearther to show the form or NOT using the value of showForm which was descided by the onlick function in the line 69 */}
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilters setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactsList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return (
    <>
      <div className="loader-container">
        <div className="loader"></div>
        <p>Please wait..</p>
      </div>
    </>
  );
}

function Header({ showForm, setShowForm }) {
  return (
    <>
      {/*(these are known as fragments that allow us to return more than one values in a function)*/}
      <header className="header">
        <div className="logo">
          <img src="logo.png" height="68" width="68" alt="project 1" />
          <h1>Fact Fusion</h1>
        </div>
        <button
          className="button button-large btn-open"
          // onclick function is to toggle the values of the state while pressing the button using ternary operator
          onClick={() => setShowForm((showForm) => (showForm ? false : true))}
        >
          {showForm ? "Close" : "Share a Fact"}
        </button>
      </header>
    </>
  );
}

//here in thebelow line we got two separate states from the parent App component as props
function NewFactForm({ setFacts, setShowForm }) {
  const [fact, setFact] = useState("");
  const [source, setSource] = useState("http.//example.com"); //here we are giving a initial state for the source input field
  const [category, setCategory] = useState("");
  const textlen = fact.length;

  async function handlesubmit(e) {
    // Adding an new Fact
    //1. Prevent the browser reload
    e.preventDefault();
    //console.log(fact, source, category);

    //2. Checks the data is valid. If so create a new fact
    //2.1 here we are checking that the source is an link or not
    const urlPattern = /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/\S*)?$/;
    if (fact && urlPattern.test(source) && category && textlen <= 200) {
      console.log("There is data");

      // //3. Create a new  fact object
      // const newfact = {
      //   id: Math.round(Math.random() * 100000),
      //   fact,
      //   source,
      //   category,
      //   Votes_interesting: 0,
      //   Votes_mindblowing: 0,
      //   Votes_falsefacts: 0,
      //   createdIn: new Date().getFullYear(),
      // };
      //3. Upload facts to supabase
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ fact, source, category }])
        .select();
      //4. Add a new fact to the UI : Add  the fact to state
      if (!error) {
        setFacts((facts) => [newFact[0], ...facts]);
      }
      //5. Reset input fields
      setFact("");
      setSource("");
      setCategory("");

      //6. Close the form by using the props from the parent component(App)
      setShowForm(false);
    }
  }

  return (
    <form className="fact_form" onSubmit={handlesubmit}>
      <input
        type="Text"
        placeholder="Share a Fact with world"
        value={fact}
        onChange={(e) => setFact(e.target.value)}
      />

      <span>{200 - textlen}</span>

      <input
        type="Text"
        placeholder="Trustworthy souce..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">choose catageory:</option>
        {/* <option value="technology">Tecnology</option>
        <option value="science">science</option>
        <option value="finance">finance</option>
        <option value="sports">Sports</option>
        <option value="space">Space</option>
        <option value="history">History</option>
        <option value="entertainment">Entertainment</option>
        <option value="news">News</option> */}
        {CATEGORIES.map((c) => (
          <option key={c.name} values={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <button className="button button-large">Post</button>
    </form>
  );
}

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function CategoryFilters({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li key="all">
          <button
            className="button button_all"
            onClick={() => setCurrentCategory("all")}
          >
            ALL
          </button>
        </li>
        {CATEGORIES.map((f) => (
          <li key={f.name} className="category">
            <button
              className="button button-x"
              style={{
                backgroundColor: f.color,
              }}
              onClick={() => setCurrentCategory(f.name)}
            >
              {f.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactsList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        No Facts Under This Category Yet !!! CREATE THE FIRST ONE
      </p>
    );
  }

  return (
    <section>
      <ul className="facts_list">
        {facts.map((f) => (
          <Fact key={f.id} f={f} setFacts={setFacts} />
        ))}
      </ul>
    </section>
  );
}

{
  /* here we use props for getting the paramenters for the Fact() function form the FactsList() */
}

function Fact({ f, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);

  //This function is to update the votes_interesting in database
  async function handleVotes1() {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ Votes_Interesting: f.Votes_Interesting + 1 })
      .eq("id", f.id)
      .select();
    setIsUpdating(false);

    if (!error) {
      setFacts((facts) =>
        facts.map((fa) => (fa.id === f.id ? updatedFact[0] : fa))
      );
    }
  }
  //This function is to update the votes_mindblowing in database
  async function handleVotes2() {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ Votes_mindblowing: f.Votes_mindblowing + 1 })
      .eq("id", f.id)
      .select();
    setIsUpdating(false);

    if (!error) {
      setFacts((facts) =>
        facts.map((fa) => (fa.id === f.id ? updatedFact[0] : fa))
      );
    }
  }
  //This function is to update the votes_falsefacts in database
  async function handleVotes3() {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ Votes_falsefacts: f.Votes_falsefacts + 1 })
      .eq("id", f.id)
      .select();
    setIsUpdating(false);

    if (!error) {
      setFacts((facts) =>
        facts.map((fa) => (fa.id === f.id ? updatedFact[0] : fa))
      );
    }
  }

  return (
    <li key={f.id} className="fact">
      <p>
        {f.fact}
        <a className="source" href={f.source} target="_">
          (source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor:
            CATEGORIES.find((x) => x.name === f.category)?.color || "#acdc",
        }}
      >
        {f.category}
      </span>
      <div className="vote_button">
        <button onClick={handleVotes1} disabled={isUpdating}>
          👍 {f.Votes_Interesting}
        </button>
        <button onClick={handleVotes2} disabled={isUpdating}>
          🤯 {f.Votes_mindblowing}
        </button>
        <button onClick={handleVotes3} disabled={isUpdating}>
          ⛔️ {f.Votes_falsefacts}
        </button>
      </div>
    </li>
  );
}
export default App;
