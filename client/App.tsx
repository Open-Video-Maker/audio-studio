import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { SWRConfig } from "swr";

import { theme } from "./theme";
import Playground from "./playground";

function App() {
  return (
    <MantineProvider theme={theme}>
      <SWRConfig
        value={{
          fetcher: (resource, init) =>
            fetch("http://localhost:3000" + resource, init).then((res) =>
              res.json()
            ),
        }}
      >
        <main className="flex flex-col items-center py-8 w-1/2 m-auto">
          <Playground />
        </main>
      </SWRConfig>
    </MantineProvider>
  );
}

export default App;
