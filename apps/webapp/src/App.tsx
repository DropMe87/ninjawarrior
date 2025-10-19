import { useEffect, useState } from 'react';
import { SDKProvider, useLaunchParams } from '@telegram-apps/sdk-react';


function Bars({ a, b }: { a:number; b:number }) {
const total = Math.max(1, a + b);
const wa = Math.round((a/total)*100); const wb = 100-wa;
return (
<div style={{border:'1px solid #222', borderRadius:12, overflow:'hidden', height:18}}>
<div style={{width:`${wa}%`, height:18, background:'#22c55e', display:'inline-block'}} />
<div style={{width:`${wb}%`, height:18, background:'#3b82f6', display:'inline-block'}} />
</div>
);
}


function BattleView() {
const lp = useLaunchParams();
const [data, setData] = useState<any>(null);


useEffect(()=>{
fetch(`/api/battles/${lp.startParam || 'demo'}`).then(r=>r.json()).then(setData);
},[]);


if(!data) return <div>Loading…</div>;
return (
<div style={{padding:16}}>
<h3>🥷 NinjaWarrior</h3>
<div style={{margin:'12px 0'}}><Bars a={Number(data.teamATotalRaw)} b={Number(data.teamBTotalRaw)} /></div>
<div style={{display:'flex', gap:8}}>
<button>Team A beitreten</button>
<button>Team B beitreten</button>
</div>
<div style={{opacity:.6, marginTop:8}}>Einsatz bleibt in **deinem Token**. Sieg zahlt in **deinem Token**.</div>
<div style={{marginTop:12}}>
<button onClick={()=> navigator.share?.({title:'Battle', url: window.location.href})}>Share-Link</button>
</div>
</div>
);
}


export default function App(){
return (
<SDKProvider>
<BattleView />
</SDKProvider>
);
}
