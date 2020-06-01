import {Component, Input, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, OnInit, AfterViewChecked} from '@angular/core';
import FormioComponent from './Base';
import Validator from 'formiojs/validator/Validator.js';
import { FormioControl } from '../FormioControl';

@Component({
  selector: 'mat-formio-comp',
  template: '<mat-card>Unknown Component: {{ instance.component.type }}</mat-card>'
})
export class MaterialComponent implements AfterViewInit, OnInit {
  @Input() instance: any;
  @ViewChild('input', {static: false}) input: ElementRef;
  @Input() control: FormioControl = new FormioControl();
  constructor(public element: ElementRef, public ref: ChangeDetectorRef) {}

  setInstance(instance: any) {
    this.control.setInstance(instance);
    instance.materialComponent = this;
    this.instance = instance;
    this.instance.disabled = this.instance.shouldDisabled;
    this.setVisible(this.instance.visible);
    this.renderComponents();
    this.onChange();
  }

  ngOnInit() {
    if (this.instance) {
      if (this.shouldValidateOnInit()) {
        this.validateOnInit();
      }
      this.instance.component.defaultValue ? this.setValue(this.instance.component.defaultValue) : '';
    }
  }

  validateOnInit() {
    const {defaultValue, key} = this.instance.component;
    const {submission} = this.instance.parent;
    const submissionValue = submission && submission.data && submission.data[key];
    const validationValue = submissionValue ? {[key]: submissionValue} : {[key]: defaultValue};

    this.instance.dataValue = submissionValue || defaultValue;

    const validationResult = Validator.checkComponent(
      this.instance,
      validationValue,
      validationValue
    );

    if (validationResult.length) {
      this.instance.error = validationResult[0];
      this.control.setErrors({ isValid: false });
      if (submissionValue || defaultValue) {
        this.control.markAsTouched();
      }
      this.ref.detectChanges();
    }
  }

  renderComponents() {}

  onChange(keepInputRaw?: boolean) {
    let value = this.getValue();

    if (value === undefined || value === null) {
      value = this.instance.emptyValue;
    }

    if (this.input && this.input.nativeElement.mask && value && !keepInputRaw) {
      this.input.nativeElement.mask.textMaskInputElement.update(value);
      this.control.setValue(this.input.nativeElement.value);
      value = this.getValue();
    }
    this.instance.updateValue(value, {modified: true});
  }

  getValue() {
    return this.control.value;
  }

  setValue(value) {
    this.control.setValue(value);
  }

  beforeSubmit() {
    this.control.markAsTouched();
  }

  hasError() {
    return this.instance && this.instance.error;
  }

  shouldValidateOnInit() {
    if (!this.instance) {
      return;
    }

    return this.instance.options.validateOnInit
      || this.instance.parent.options.validateOnInit;
  }

  setDisabled(disabled) {
    if (disabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  setVisible(visible) {
    if (this.element && this.element.nativeElement) {
      if (visible) {
        this.element.nativeElement.removeAttribute('hidden');
        this.element.nativeElement.style.visibility = 'visible';
        this.element.nativeElement.style.position = 'relative';
      } else {
        this.element.nativeElement.setAttribute('hidden', true);
        this.element.nativeElement.style.visibility = 'hidden';
        this.element.nativeElement.style.position = 'absolute';
      }
    }
  }

  ngAfterViewInit() {
    if (this.element && this.element.nativeElement && this.instance) {
      // Add custom classes to elements.
      if (this.instance.component.customClass) {
        this.element.nativeElement.classList.add(this.instance.component.customClass);
      }
    }

    if (this.input) {
      // Set the input masks.
      this.instance.setInputMask(this.input.nativeElement);
    }
  }
}

FormioComponent.MaterialComponent = MaterialComponent;
export { FormioComponent };
