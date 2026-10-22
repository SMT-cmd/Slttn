import test from "node:test";
import assert from "node:assert/strict";
import { serializePortfolioBooks } from "./portfolio-feed.ts";
import type { CatalogBook } from "./catalog";

const row = (slug: string, published: boolean, sort_order: number): CatalogBook => ({
  id:"private-database-id",slug,title:slug,subtitle:"",category:"Trading",size:"short",
  launch_mode:"prelaunch",cover_url:"/covers/example.png",blurb:"Public description",
  published,sort_order,created_at:"",updated_at:"",
});

test("book feed exposes published titles only, in catalogue order",()=>{
  const books=serializePortfolioBooks([row("visible-last",true,3),row("private-draft",false,0),row("visible-first",true,1)]);
  assert.deepEqual(books.map(b=>b.slug),["visible-first","visible-last"]);
  assert.equal(books[0].url,"https://library.slttradehub.trade/visible-first");
  assert.equal(books[0].cover_url,"https://library.slttradehub.trade/covers/example.png");
  assert.equal("id" in books[0],false);
  assert.equal("published" in books[0],false);
  assert.equal("launch_mode" in books[0],false);
});
test("book feed excludes unsafe path-like slugs",()=>{
  const books=serializePortfolioBooks([row("../secrets",true,0),row("safe-book-101",true,1),row("CAPS",true,2)]);
  assert.deepEqual(books.map(b=>b.slug),["safe-book-101"]);
});
test("book feed caps externally visible catalogue metadata at 24 items",()=>{
  const books=serializePortfolioBooks(Array.from({length:45},(_,i)=>row("title-"+i,true,i)));
  assert.equal(books.length,24);
});
