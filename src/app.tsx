import { useEffect, useState } from "react";
import { GuesserModule } from "./module";


function App() {
    const [module, setModule] = useState('');
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        let targetModule = '';
        for (const [key, value] of params){
            if (key === 'module') targetModule = value;
        }

        if (targetModule.length > 0) setModule(targetModule);
        else setModule('guesser');
    }, []);

    return <div>
        {module === 'guesser' && <GuesserModule />}
    </div>;
}

export default App;
