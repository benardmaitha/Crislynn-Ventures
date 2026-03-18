// ── NAVBAR: scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── HERO: background zoom on load ──
window.addEventListener('load', () => {
  document.getElementById('hero').classList.add('loaded');
});

// ── SCROLL REVEAL: IntersectionObserver ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealObserver.observe(el));

/* =========================================
   EXPERIENCE SLIDER
========================================= */

document.querySelectorAll(".exp-slider").forEach(slider=>{

const cards=slider.querySelector(".exp-cards");
const card=slider.querySelector(".exp-card");
const left=slider.querySelector(".left");
const right=slider.querySelector(".right");

const gap=20;
const visible=3;

let index=0;
let startX=0;
let isDown=false;

const total=cards.children.length;

/* create dots */

const dotsContainer=document.createElement("div");
dotsContainer.className="exp-dots";

for(let i=0;i<total-visible+1;i++){

const dot=document.createElement("div");
dot.className="exp-dot";

if(i===0) dot.classList.add("active");

dotsContainer.appendChild(dot);

}

slider.appendChild(dotsContainer);

const dots=dotsContainer.querySelectorAll(".exp-dot");


function updateSlider(){

const cardWidth=card.offsetWidth+gap;

cards.style.transform=`translateX(${-index*cardWidth}px)`;

/* update dots */

dots.forEach(d=>d.classList.remove("active"));
if(dots[index]) dots[index].classList.add("active");

/* scale cards */

const allCards=slider.querySelectorAll(".exp-card");

allCards.forEach(c=>{
c.classList.remove("big","small");
});

if(allCards[index+1]){
allCards[index+1].classList.add("big");
}

if(allCards[index]){
allCards[index].classList.add("small");
}

if(allCards[index+2]){
allCards[index+2].classList.add("small");
}

}

/* arrows */

left.onclick=()=>{
index--;
if(index<0) index=0;
updateSlider();
}

right.onclick=()=>{
index++;
if(index>total-visible) index=total-visible;
updateSlider();
}

/* drag */

cards.addEventListener("mousedown",e=>{
isDown=true;
startX=e.pageX;
});

document.addEventListener("mouseup",()=>{
isDown=false;
});

document.addEventListener("mousemove",e=>{

if(!isDown) return;

const move=e.pageX-startX;

if(move>100){
index--;
if(index<0) index=0;
updateSlider();
isDown=false;
}

if(move<-100){
index++;
if(index>total-visible) index=total-visible;
updateSlider();
isDown=false;
}

});

/* touch */

cards.addEventListener("touchstart",e=>{
startX=e.touches[0].clientX;
});

cards.addEventListener("touchend",e=>{

let endX=e.changedTouches[0].clientX;
let move=endX-startX;

if(move>60){
index--;
if(index<0) index=0;
}

if(move<-60){
index++;
if(index>total-visible) index=total-visible;
}

updateSlider();

});

/* initial state */

updateSlider();

});


/* =========================================
   CLICKABLE CARDS
========================================= */

document.querySelectorAll(".exp-card").forEach(card=>{

card.addEventListener("click",()=>{

const link=card.querySelector(".exp-link");

if(!link) return;

const data={
title:link.dataset.title,
image:link.dataset.image,
video:link.dataset.video,
desc:link.dataset.desc
};

localStorage.setItem("selectedExperience",JSON.stringify(data));

window.location.href = link.getAttribute("href");

});

});

/* 
── ITINERARY TOGGLE ──
function toggleItinerary(btn) {
  const itinerary = btn.nextElementSibling;
  const isOpen = itinerary.classList.contains('open');
  // Close all open itineraries
  document.querySelectorAll('.exp-itinerary.open').forEach(el => {
    el.classList.remove('open');
    el.previousElementSibling.textContent = 'View Itinerary ›';
  });
  // Open clicked one if it was closed
  if (!isOpen) {
    itinerary.classList.add('open');
    btn.textContent = 'Close ×';
  }
}
  */

// ── MOBILE NAV ──
const navBurger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');
if (navBurger) {
  navBurger.addEventListener('click', () => {
    const isOpen = navLinks.style.display === 'flex';
    navLinks.style.display = isOpen ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '80px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(245,240,232,0.98)';
    navLinks.style.padding = '24px 48px';
    navLinks.style.gap = '20px';
  });
}

// ── FORM: submit handler ──
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target;
  btn.textContent = "Sent! We'll be in touch ✓";
  btn.style.background = '#4A7A5A';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "Request Services ›";
    btn.style.background = '';
    btn.disabled = false;
  }, 4000);
}
