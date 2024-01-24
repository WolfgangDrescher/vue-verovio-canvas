<script setup>
import VerovioCanvasWrapper from './VerovioCanvasWrapper.vue';
import createVerovioWorker from './verovio-worker.js?worker';
const worker = createVerovioWorker();

const kernScore = `**kern	**kern	**kern
*staff3	*staff2	*staff1
*clefF4	*clefG2	*clefG2
*k[b-e-]	*k[b-e-]	*k[b-e-]
*g	*g	*g
*M3/8	*M3/8	*M3/8
=1	=1	=1
4G	4.r	16r
.	.	16ddL
.	.	16b-
.	.	16g
8E-	.	8ggJ
=2	=2	=2
4D	16r	4.ff
.	16aL	.
.	16f	.
.	16d	.
8B-	[8ddJ	.
=3	=3	=3
4G	8.dd]L	4.ee-
.	16b-	.
8A	[8ccJ	.
=4	=4	=4
16B-L	8.cc]L	4.dd
16d	.	.
16B-	.	.
16G	16a	.
[8gJ	8b-J	.
=5	=5	=5
8.g]L	4.a	4cc
16e	.	.
8f#J	.	8dd
=6	=6	=6
4g	16aL	8.b-L
.	16f#J	.
.	[4g	.
.	.	16b-
8c	.	8ee-J
=7	=7	=7
4d	4g]	8.aL
.	.	16b-
8D	8f#	8ccJ
=8	=8	=8
16GL	4.g	4.b-
16D	.	.
16BB-	.	.
16GG	.	.
8GJ	.	.
*-	*-	*-`;

function moduleIsReady() {
    console.log('moduleIsReady');
}

function scoreIsReady() {
    console.log('scoreIsReady');
}

function scoreLoaded() {
    console.log('scoreLoaded');
}
</script>

<template>
    <VerovioCanvasWrapper :worker="worker" lazy unload :lazy-delay="1000" url="https://raw.githubusercontent.com/WolfgangDrescher/lassus-geistliche-psalmen/master/kern/01-beatus-vir.krn" @module-is-ready="moduleIsReady" @score-is-ready="scoreIsReady" @score-loaded="scoreLoaded" />
    <VerovioCanvasWrapper :worker="worker" lazy unload :lazy-delay="1000" :data="kernScore" @module-is-ready="moduleIsReady" @score-is-ready="scoreIsReady" @score-loaded="scoreLoaded" />
</template>
