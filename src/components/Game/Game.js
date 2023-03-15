import React from "react";
import styles from "./game.module.scss";
import { range, sample } from "../../utils";
import { WORDS } from "../../data";
import { NUM_OF_GUESSES_ALLOWED } from "../../constants";
import { checkGuess } from "../../game-helpers";

// Pick a random word on every pageload.
const answer = sample(WORDS);
// To make debugging easier, we'll log the solution in the console.
console.info({ answer });

function Game() {
  const [status, setStatus] = React.useState(undefined);
  const [guessInputs, setGuessInputs] = React.useState(() => {
    const maxGuessGrid = range(NUM_OF_GUESSES_ALLOWED).map((el) => {
      return {
        key: crypto.randomUUID(),
        word: []
      };
    });
    const guessObj = {
      tries: 0,
      guesses: maxGuessGrid
    };
    return guessObj;
  });

  function handleGuessSubmit(word) {
    setGuessInputs(({ tries, guesses }) => {
      const newGuesses = [...guesses];
      const result = checkGuess(word, answer);

      newGuesses[tries] = { ...newGuesses[tries], word: result };
      const updatedTries = tries + 1;

      const correctCount = result.reduce((accu, { letter, status }) => {
        if (status === "correct") {
          return accu + 1;
        }
        return accu;
      }, 0);

      if (correctCount === 5) {
        setStatus("correct");
      }

      return {
        tries: updatedTries,
        guesses: newGuesses
      };
    });
  }

  return (
    <div
      style={{
        width: "100%",
        height: "40rem",
        position: "relative"
      }}
    >
      <GuessInputList guessInputs={guessInputs.guesses} />
      <GuessInputForm
        tries={guessInputs.tries}
        status={status}
        handleGuessSubmit={handleGuessSubmit}
      />
    </div>
  );
}

function HappyBanner({ tries }) {
  return (
    <div className="happy banner">
      <p>
        <strong>Congratulations! </strong> Got it in
        <strong> {tries} guesses</strong>
      </p>
    </div>
  );
}

function SadBanner() {
  return (
    <div className="sad banner">
      <p>
        Sorry, the correct answer is <strong>{answer}</strong>.
      </p>
    </div>
  );
}

function GuessInputForm({ handleGuessSubmit, status, tries }) {
  const [wordInput, setWordInput] = React.useState("");

  function handleWordInput(e) {
    const convertedToUpper = e.target.value.toUpperCase();
    setWordInput(convertedToUpper);
  }

  return (
    <>
      <form
        className={styles.game}
        onSubmit={(e) => {
          e.preventDefault();
          handleGuessSubmit(wordInput);
          setWordInput("");
        }}
      >
        <label htmlFor="guessInput" className={styles.gameInputLabel}>
          Enter guess:
        </label>
        <input
          disabled={tries === NUM_OF_GUESSES_ALLOWED || status === "correct"}
          required
          type="text"
          name="guess-input"
          id="guessInput"
          className={styles.gameInput}
          onChange={handleWordInput}
          value={wordInput}
          pattern=".{5}"
          maxLength={5}
        />
      </form>

      {tries === NUM_OF_GUESSES_ALLOWED && <SadBanner />}
      {status === "correct" && <HappyBanner tries={tries} />}
    </>
  );
}

function GuessInputList({ guessInputs }) {
  const placeholder = range(1, 5);
  return (
    <div className="guess-results">
      {guessInputs.map(({ key, word }) => {
        if (word.length === 0)
          return (
            <p className="guess" key={key}>
              {placeholder.map((el, idx) => (
                <span className="cell" key={idx}></span>
              ))}
            </p>
          );
        return (
          <p className="guess" key={key}>
            {word.map(({ letter, status }, idx) => (
              <span className={`cell ${status}`} key={idx}>
                {letter}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default Game;
