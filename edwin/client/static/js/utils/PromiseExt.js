function makeDeferred() {
  let resolve, reject;
  const promise = new Promise((resolve_, reject_) => {
    resolve = resolve_;
    reject = reject_;
  });
  return {
    resolve,
    reject,
    promise,
  };
}

function allResolves(promises) {
  let results = new Array(promises.length);
  let d = makeDeferred();
  let count = 0;
  let rejectSymbol = Symbol('reject');

  function checkCompletion() {
    if (count >= promises.length) {
      let filteredResults = results.filter(v => v !== rejectSymbol);
      d.resolve(filteredResults);
    }
  }

  for (let i = 0; i < promises.length; i++) {
    let p = promises[i];
    p.then(result => {
      results[i] = result;
      count++;
      checkCompletion();
    })
    .catch(() => {
      results[i] = rejectSymbol;
      count++;
      checkCompletion();
    });
  }

  return d.promise;
}

export default {
  allResolves,
};
