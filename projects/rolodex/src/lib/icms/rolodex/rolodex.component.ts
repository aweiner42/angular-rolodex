import {Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import { ItemService} from '../item.service';
import { Item } from '../item.model';
import {CssValue} from '../css-value';
import {CssPoint} from '../css-point';

@Component({
  selector: 'app-rolodex',
  templateUrl: './rolodex.component.html',
  styleUrls: ['./rolodex.component.scss'],
  encapsulation : ViewEncapsulation.Emulated
})

export class RolodexComponent implements OnInit {
  private readonly startPoint: CssPoint;
  private readonly endPoint: CssPoint;
  private readonly unitVector: CssPoint;
  private tempPoint: CssPoint;
  private readonly magnitude: number;
  private readonly magnitudeScale: number;
  private runningTick: boolean;
  private lastTickTime: number;

  constructor(private itemService: ItemService) {
    console.log('RolodexComponent.constructor');

    // init ui control constants
    this.startPoint = new CssPoint(new CssValue(20, '%'), new CssValue(-100, '%'), new CssValue(-3000, 'px'));
    this.endPoint = new CssPoint(new CssValue(0, '%'), new CssValue(100, '%'), new CssValue(1000, 'px'));

    this.unitVector = new CssPoint(new CssValue(0, '%'), new CssValue(0, '%'), new CssValue(0, 'px'));
    this.tempPoint = new CssPoint(new CssValue(0, '%'), new CssValue(0, '%'), new CssValue(0, 'px'));

    this.unitVector.clone(this.endPoint);
    this.tempPoint.clone(this.startPoint);
    this.tempPoint.scale(-1.0);
    this.unitVector.add(this.tempPoint);
    this.magnitude = this.unitVector.mag();
    this.magnitudeScale = 1.0 / this.magnitude;
    this.unitVector.scale(this.magnitudeScale);

    this.touched = false;
    this.moving = false;
    this.rolodexCardStyle = [];
  }
  theItems: Item[];

  // rolodex class modifiers
  rolodexCardStyle: { [key: string]: any }[];
  cardIndex: number;


  // control states
  private touched: boolean;
  private moving: boolean;

  // distance that must be greater than to trigger a pull push type of interaction
  triggerDistance = 50; // must be greater than pixels of movement

  // rolodex mechanics, for now velocity
  // f=Ma
  // fDrag = -kV

  kDrag = 0.001;
  kScreenConvert = 1.0 / 5000.0;
  kTouchForce = 0.00001;
  kTouchVelocityForce = 0.00005;


  tickTime = 1000.0 / 60.0; // msecs/frame
  mass = 10.0; // in grams???
  forceTouch = 0.0; // resets to 0 after applied
  lastTouchY = 0;
  maxVelocity = 0.0007;

  tickClock;  // interval timer for the main tick
  velocity = 0.00010; // unit vector magnitude (0.0 to 1.0) /sec
  offset = 0.5;  // represents drawer beginning 0.0 - 1.0 and wraps
  rolodexDebugger: true;
  force: any;
  forceTouchVelocity: any;

  direction = 1.0;  // start off moving with drag

  // declare mouse event touch points
  // startTouchPoint = {x: 0, y: 0, time: 0};
  // touchMoved = {x: 0, y: 0, time: 0};
  // endTouchMove = {x: 0, y: 0, time: 0};
  lastTouch = {x: 0, y: 0, time: 0};

  positionTheCards() {
    // console.log('positionTheCards: num of cards = ', this.theItems.length);
    const cardDelta = 1.0 / this.theItems.length;
    let index;
    for (index = 0; index < this.theItems.length; index++) {
      // calculate base css translation unit (modulus)
      const multiplier = (this.offset + index * cardDelta) % 1.0;
      this.tempPoint.clone(this.unitVector);
      this.tempPoint.scale(multiplier * this.magnitude);

      const newX = this.startPoint.x.val + this.tempPoint.x.val;
      const newY = this.startPoint.y.val + this.tempPoint.y.val;
      const newZ = this.startPoint.z.val + this.tempPoint.z.val;
      // console.log('positionTheCards index = ', index);
      this.rolodexCardStyle[index] =
        {
          transform: 'translate3d('
            + newX + this.startPoint.x.units + ','
            + newY + this.startPoint.y.units + ','
            + newZ + this.startPoint.z.units + ')',
          'z-index': Math.floor(multiplier * this.theItems.length)
        };
      // console.log('the style for card ', index, 'is', this.rolodexCardStyle[index]);
    }
  }

  // timer tick and motion support

  mouseStartEvent(event) {
    // event.preventDefault();
    // this.startTouchPoint.x = event.changedTouches[0].clientX;
    // this.startTouchPoint.y = event.changedTouches[0].clientY;
    // this.startTouchPoint.time = Date.now();
    event.preventDefault();
    this.lastTouchY = event.clientY;
    this.touched = true;

  }
  mouseStopEvent(event) {
    // this.endTouchMove.x = event.changedTouches[0].clientX;
    // this.endTouchMove.y = event.changedTouches[0].clientY;
    // this.endTouchMove.time = Date.now();
    this.touched = false;
    this.moving = false;
  }
  mouseMoveEvent(event) {
  //  event.preventDefault();
    if (this.touched) {
      this.lastTouch.time = Date.now();
      // event.preventDefault();
      this.lastTouch.x = event.clientX;
      this.lastTouch.y = event.clientY;
      this.moving = true;
    }
  }
  touchStartEvent(event) {
    // event.preventDefault();
    // this.startTouchPoint.x = event.changedTouches[0].clientX;
    // this.startTouchPoint.y = event.changedTouches[0].clientY;
    // this.startTouchPoint.time = Date.now();
    this.lastTouchY = event.changedTouches[0].clientY;
    this.touched = true;

  }

  touchStopEvent(event) {
    // this.endTouchMove.x = event.changedTouches[0].clientX;
    // this.endTouchMove.y = event.changedTouches[0].clientY;
    // this.endTouchMove.time = Date.now();
    // event.preventDefault();
    this.touched = false;
    this.moving = false;
  }

  touchMoveEvent(event) {
    // event.preventDefault();
    this.lastTouch.time = Date.now();
    this.lastTouch.x = event.changedTouches[0].clientX;
    this.lastTouch.y = event.changedTouches[0].clientY;
    this.moving = true;
  }

  addEventHandlers() {
    // first bind the touch events
    // const elem = document.getElementById('rolodex');
    const elem = document;
    elem.addEventListener('mousedown', this.mouseStartEvent.bind(this), false);
    elem.addEventListener('mouseup', this.mouseStopEvent.bind(this), false);
    elem.addEventListener('mousemove', this.mouseMoveEvent.bind(this), false);
    elem.addEventListener('touchstart', this.touchStartEvent.bind(this), false);
    elem.addEventListener('touchend', this.touchStopEvent.bind(this), false);
    elem.addEventListener('touchmove', this.touchMoveEvent.bind(this), false);
  }

  startRolodex() {
    // document.addEventListener('DOMContentLoaded', this.addEventHandlers);
    this.addEventHandlers();
    this.runningTick = false;
    this.lastTickTime = Date.now();
    this.tickClock = setInterval(() => {
     this.rolodexTick();
    }, this.tickTime);
  }

  rolodexTick() {
    // this is the base time tick
    const currentTickTime = Date.now();

    // first test is seeing if the interval keeps up with time
    if (this.runningTick) {
      // ignore tick and process next one
      return;
    }
    this.runningTick = true;

    //  reading the actual time on each tick to get accurate v
    const currentTickDelta = currentTickTime - this.lastTickTime;
    this.lastTickTime = currentTickTime;

    // f = ma
    // calculate current forces
    // just one axis for now

    // first the force of drag, no one touches it
    const forceDrag = -1.0 * this.kDrag * this.velocity;

    // then force if we have a touch event happening
    let forceTouch = 0.0;
    let forceTouchVelocity = 0.0;
    if (this.touched) {
      // update any forces based on touching*kTouchForce
      if (this.velocity !== 0.0) {
        let sign = 1.0;
        if (this.velocity > 0.0){
          sign = -1.0;
        }
        forceTouch = sign * this.kTouchForce; // todo: add touch pressure in place of 1.0 for iPhone 7 devices
      }

      // velocityOfTouch * kTouchVelocityForce
      if (this.moving) {
        const touchDistance = this.lastTouch.y - this.lastTouchY;
        this.lastTouchY = this.lastTouch.y;
        // if (touchDistance<09.0 && velocity<0.0)
        forceTouchVelocity = this.kTouchVelocityForce * touchDistance / currentTickDelta;
      }
    }


    const force = forceDrag + forceTouch + forceTouchVelocity; // so far
    forceTouch = 0.0; // instead of testing, just clear it
    // let magForce = force;
    // if (magForce < 0.0) {
    //   magForce *= -1.0;
    // }
    /* if (magForce<.00001) {
       force = 0.0;
     }
   */

    // calculate velocity
    // for now assuming all tick times are the same tickTime
    const acceleration = force / this.mass;

    this.velocity = this.velocity + acceleration * currentTickDelta;
    let magVel = this.velocity;
    let velocitySign = 1.0;
    if (magVel < 0.0) {
      magVel *= -1.0;
      velocitySign = -1.0;
    }
    if (magVel < .00001) {
      this.velocity = 0.0;
    }
    if (magVel > this.maxVelocity) {
      this.velocity = this.maxVelocity * velocitySign;
    }

    // calculate position
    this.offset = this.offset + this.velocity * currentTickDelta;
    if (this.offset < 0.0) {
      this.offset += 1.0;
    }
    this.offset = this.offset % 1.0;

    this.positionTheCards();
    this.runningTick = false;
  }


  ngOnInit(): void {
   // console.log('rolodex.component.onInit() filling the item list');

    this.itemService.getItems().subscribe( data => {
      this.theItems = data.map(changes => {
        return {
          id: changes.payload.key,
          ...changes.payload.val()
        } as Item;
      });
      console.log('ngOnInit():the items  =', this.theItems);

      // now fill the rolodexStartTick starts to empty and start first one
      // initialize to blank, then set to rolling when we want the animationtio start
      // and set default to moving

      // set initial positions
      this.positionTheCards();

      // now trigger the clock

      this.startRolodex();

      console.log('ngOnInit():finished setting up items');
    });
    console.log('ngOnInit():finished setting read data');
  }

  // ngOnDestroy() {
  //   if (this.tickClock) {
  //     clearInterval(this.tickClock);
  //   }
  // }

  create(item: Item) {
    this.itemService.createItem(item);
  }

  update(item: Item) {
    this.itemService.updateItem(item);
  }

  delete(id: string) {
    this.itemService.deleteItem(id);
  }

  getRolodexCardStyle(i: number) {
    const tmpStyle = this.rolodexCardStyle[i];
    // console.log('the style = ', tmpStyle);
    return tmpStyle;
  }
}
