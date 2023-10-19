import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

import { theme } from "./theme";
import Playground from "./playground";

function App() {
  return (
    <MantineProvider theme={theme}>
      <main className="flex flex-col items-center py-8 w-1/2 m-auto">
        <Playground />
      </main>
    </MantineProvider>
  );
}

export default App;
