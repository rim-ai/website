import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Typed from 'typed.js';

@Component({
  selector: 'main-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main_component.html',
  styleUrls: ['./main_component.css']
})

export class MainComponent {
  open = false;

  ngOnInit() {
    const options = {
      strings: ['AI Leaders', 'Data Leaders', 'AI Engineers', 'Data Scientist', 'Data Engineers', 'Data Strategists', 'Cyber Security Experts'],
      typeSpeed: 100,
      backSpeed: 100,
      showCursor: true,
      cursorChar: '|',
      loop: true
    };

    const typed = new Typed('.typed-element', options);
  }
}
