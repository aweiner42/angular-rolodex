import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolodexComponent } from './rolodex.component';

describe('RolodexComponent', () => {
  let component: RolodexComponent;
  let fixture: ComponentFixture<RolodexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RolodexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolodexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
