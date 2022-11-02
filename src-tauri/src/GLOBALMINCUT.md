**Procedure** Contract($G$)

**repeat** until $G$ has 2 vertices.

&emsp; **choose** an edge $(v, w)$ with probability proportional to the weight of $(v, w)$
&emsp; **let** $G \leftarrow G / (v, w)$

**return** $G$

---

**Procedure** to Contract Edge $(u, v)$

**Let** $D(u) \leftarrow D(u) + D(v) - 2W(u, v)$

**Let** $D(v) \leftarrow 0$

**Let** $W(u, v) \leftarrow W(u, v) \leftarrow 0$

For each vertex $w$ except $u$ and $v$

&emsp; **Let** $W(u, w) \leftarrow W(u, w) + W(v, w)$

&emsp; **Let** $W(w, u) \leftarrow W(w, u) + W(w, v)$

&emsp; **Let** $W(v, w) \leftarrow W(w, v) \leftarrow 0$

---

Recursive-Contract($G,n$)

**input** A graph $G$ of size $n$.

**if** $G$ has fewer than 6 vertices

**then**

&emsp; $G' \leftarrow Contract(G,2)$

&emsp; **return** the weight of cut ($A = s(a), B=s(b)$) in $G'$

**else repeat twice**

&emsp; $G' \leftarrow Contract(G, \lceil n/ \sqrt 2 + 1 \rceil) $

&emsp; $G' \leftarrow Recursive-Contract(G', \lceil n/ \sqrt 2 + 1 \rceil) $

&emsp; **return** the smaller of the two resulting values.
