function runAsyncInterval(callback, interval = 1000) {
  setInterval(async () => {
    const results = await Promise.resolve(42); // this might fetch some data from server
    callback(results);
  }, interval);
}

// Goal: We want to test that function - make sure our callback was called
// The easiest way would be to pause inside test for as long as we neeed:

const pause = (ms) => new Promise((res) => setTimeout(res, ms));

// Remove ".skip" to run this test:

it.skip("should call async callback when pausing for 1 sec", async () => {
  const mockCallback = jest.fn();

  runAsyncInterval(mockCallback);

  await pause(1000);
  expect(mockCallback).toHaveBeenCalledTimes(1);
});

// This works but it sucks we have to wait 1 sec for this test to pass
// Not only that but it also makes jest warns us with:

// "Jest did not exit one second after the test run has completed."
// "This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue"

// We can use jest fake timers to speed up the timeout and get rid of warning

// Unfortunately this won't work - jest fake timers do not work well with promises.
// remove ".skip" to check that it doesn't work:

it.skip("should call async callback but IT DOES NOT WORK", () => {
  // no longer async
  jest.useFakeTimers();
  const mockCallback = jest.fn();

  runInterval(mockCallback);

  jest.advanceTimersByTime(1000);
  expect(mockCallback).toHaveBeenCalledTimes(1);
});

// If our runInterval function didn't have a promise inside that would be fine:

function runSyncInterval(callback, interval = 1000) {
  setInterval(() => {
    callback();
  }, interval);
}

it("should call sync callback", () => {
  jest.useFakeTimers();
  const mockCallback = jest.fn();

  runSyncInterval(mockCallback);

  jest.advanceTimersByTime(1000);
  expect(mockCallback).toHaveBeenCalledTimes(1); // works!
});

// What we need to do is to have some way to resolve the pending promises. One way to do it is to use setImmediate:

function flushPromises() {
  return new Promise(jest.requireActual("timers").setImmediate);
}

it("should call async callback when flushing Promises", async () => {
  jest.useFakeTimers();
  const mockCallback = jest.fn();

  runAsyncInterval(mockCallback);

  jest.advanceTimersByTime(1000);
  await flushPromises();
  expect(mockCallback).toHaveBeenCalledTimes(1);
});
