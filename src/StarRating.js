import "./StarRating.scss";

const componentTemplate = document.createElement('template');
componentTemplate.innerHTML = `
<div class="star-rating">
  <div class="star-rating__stars-empty"></div>
  <div class="star-rating__stars-full"></div>
</div>`;

const starTemplate = document.createElement('template');
starTemplate.innerHTML = `<span class="star"></span>`;

const DEFAULT_NUM_STARS = 5;
const DEFAULT_MAX_VALUE = 5;

class StarRating extends HTMLElement {
  constructor(){
    super();

    this._clonedNode = componentTemplate.content.cloneNode(true);

    this._fullStars = this._clonedNode.querySelector('.star-rating__stars-full');
    this._emptyStars = this._clonedNode.querySelector('.star-rating__stars-empty');

    this._spacingRatioOfStarWidth = 0.6;

    // attribute reflected values
    this._numStars = DEFAULT_NUM_STARS;
    this._maxValue = DEFAULT_MAX_VALUE;
    this._value = 0;
  }

  connectedCallback() {
    this.validateAttributes();

    let starWidthInPx = this.getStarWidthInPx();
    let spacingInPx = this.getSpacingInPx(starWidthInPx);

    // we need to create the required stars. We only do this once in this method
    // the only thing we need to worry about changing is the rating value itself
    for(let i = 0; i < this._numStars; i++){
      let star = starTemplate.content.cloneNode(true).firstChild;

      let starWidthFactor = this.getWidthFactorForStar(i + 1);

      if(starWidthFactor > 0){
        star.style.width = `${starWidthInPx*starWidthFactor}px`;
      }
      else{
        star.style.width = 0;
      }

      star.style.height = `${starWidthInPx}px`;

      if(i > 0){
        star.style.marginLeft = `${spacingInPx/2}px`;
      }

      if(i < this._numStars - 1){
        star.style.marginRight = `${spacingInPx/2}px`;
      }

      this._fullStars.appendChild(star);
    }

    for(let i = 0; i < this._numStars; i++){
      let star = starTemplate.content.cloneNode(true).firstChild;
      star.style.width = star.style.height = `${starWidthInPx}px`;

      if(i > 0){
        star.style.marginLeft = `${spacingInPx/2}px`;
      }

      if(i < this._numStars - 1){
        star.style.marginRight = `${spacingInPx/2}px`;
      }

      this._emptyStars.appendChild(star);
    }

    // we base the height on the width and the height will always adjust when the width changes
    // We need to take the number of stars and maintain a proportion. The spacing btwn stars
    // will be a fixed proportion and then the stars themselves divide the remaining space.
    // this sizing needs to be recalculated each time.
    // We use margin-left on the first star, margin-right on the last star and margin-left and
    // margin-right on remaining stars to set the spacing between stars
    this.style.height = `${25*(this.clientWidth/137)}px`;

    this.appendChild(this._clonedNode);
  }

  updateStars(){
    this.validateAttributes();

    let starWidthInPx = this.getStarWidthInPx();

    if(typeof starWidthInPx === 'undefined') return;

    // we need to create the required stars. We only do this once in this method
    // the only thing we need to worry about changing is the rating value itself
    for(let i = 0; i < this._fullStars.children.length; i++){
      let star = this._fullStars.children[i];

      let starWidthFactor = this.getWidthFactorForStar(i + 1);

      if(starWidthFactor > 0){
        star.style.width = `${starWidthInPx*starWidthFactor}px`;
      }
      else{
        star.style.width = 0;
      }
    }
  }

  static get observedAttributes() {
    return ['value', 'max-value', 'num-stars', 'class', 'style'];
  }
  
  attributeChangedCallback(attrName, oldValue, newValue) {
    if(attrName == 'class' || attrName == 'style'){
      this.style.height = `${25*(this.clientWidth/137)}px`;
      return;
    }

    if(newValue == oldValue) return;

    this[attrName] = newValue;

    // reflecting attributes which have hyphens in attribute name. We need this code
    // because custom elements do not automatically reflect such attributes to property
    // names. We use hyphenated names because this is convention and we can't use
    // camelcased attribute names because the HTML standard does not support them
    if(attrName == 'max-value'){
      this.maxValue = newValue;
    }

    if(attrName == 'num-stars'){
      this.numStars = newValue;
    }
  }

  get value() {
    return this._value;
  }

  get maxValue() {
    return this._maxValue;
  }

  get numStars() {
    return this._numStars;
  }

  // property for setting the value attribute
  set value(val) {
    var floatVal = parseFloat(val);
    if(isNaN(floatVal ) || floatVal < 0){
      floatVal = 0;
    }

    this._value = floatVal;

    this.updateStars();
  }

  // property for setting the max-value attribute
  set maxValue(val) {
    var intVal = parseInt(val);
    if(isNaN(intVal ) || intVal < 0){
      // default value
      this._maxValue = DEFAULT_MAX_VALUE;
    }

    this._maxValue = intVal;
  }

  // property for setting the num-stars attribute
  set numStars(val) {
    var intVal = parseInt(val);
    if(isNaN(intVal ) || intVal < 0){
      // default value
      this._numStars = DEFAULT_NUM_STARS;
    }

    this._numStars = intVal;
  }

  validateAttributes(){
    // value cannot be greater than maxValue
    if(this._value > this._maxValue){
      this.value = this._maxValue;
    }
  }

  getStarWidthInPx(){
    return this.clientWidth/(this._numStars + this._spacingRatioOfStarWidth*(this._numStars - 1));
  }

  getSpacingInPx(starWidth){
    return starWidth*this._spacingRatioOfStarWidth;
  }

  getWidthFactorForStar(starNumber){
    let valuePerStar = this._maxValue/this._numStars;

    if(valuePerStar*starNumber <= this._value) return 1;

    // some proportion of current star
    if(valuePerStar*starNumber > this._value && valuePerStar*(starNumber - 1) < this._value) return (this._value - valuePerStar*(starNumber - 1))/valuePerStar;

    return 0;
  }
}

customElements.define('star-rating', StarRating);

export default StarRating;