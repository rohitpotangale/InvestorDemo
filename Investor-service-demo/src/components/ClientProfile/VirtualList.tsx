import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
type Props<T> = { items:T[]; itemKey:(item:T)=>string; renderItem:(item:T)=>ReactNode; rowHeight?:number; initialRows?:number; overscan?:number; ariaLabel:string; className?:string; empty?:ReactNode };
export function VirtualList<T>({items,itemKey,renderItem,rowHeight=82,initialRows=10,overscan=4,ariaLabel,className='',empty}:Props<T>) {
  const ref=useRef<HTMLDivElement>(null), [top,setTop]=useState(0), [height,setHeight]=useState(rowHeight*initialRows);
  useEffect(()=>{ const n=ref.current; if(!n)return; const update=()=>setHeight(n.clientHeight||rowHeight*initialRows); update();
    if(typeof ResizeObserver!=='undefined'){const ro=new ResizeObserver(update);ro.observe(n);return()=>ro.disconnect();}
    window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update);
  },[rowHeight,initialRows]);
  useEffect(()=>{setTop(0);if(ref.current)ref.current.scrollTop=0;},[items]);
  if(!items.length)return <div className="cp-virtual-empty">{empty}</div>;
  const first=Math.max(0,Math.floor(top/rowHeight)-overscan), count=Math.ceil(height/rowHeight)+overscan*2, last=Math.min(items.length,first+count);
  return <div ref={ref} role="list" aria-label={ariaLabel} className={`cp-virtual-list ${className}`} onScroll={e=>setTop(e.currentTarget.scrollTop)} style={{height:rowHeight*initialRows,overflowY:'auto',position:'relative',contain:'content'}}>
    <div style={{height:items.length*rowHeight,position:'relative'}}>{items.slice(first,last).map((item,i)=><div key={itemKey(item)} role="listitem" style={{position:'absolute',top:(first+i)*rowHeight,left:0,right:0,height:rowHeight,boxSizing:'border-box'}}>{renderItem(item)}</div>)}</div>
  </div>;
}
