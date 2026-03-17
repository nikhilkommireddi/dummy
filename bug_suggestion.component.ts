import {LiveAnnouncer} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild, WritableSignal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioChange, MatRadioModule} from '@angular/material/radio';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {Router, RouterModule} from '@angular/router';
import {BugAnalyzeService} from '../services/bug_analyze.service';

import {
  ADVANCE_SEVERITIES, ALL_PRODUCT_AREAS, ALL_SEARCH_PRODUCT_AREAS,
  ASSISTANT_COMPONENT_ID, BUG_TYPE_OPTIONS, FILTER_CONFIG,
  HOTLIST_IDS, PRIORITIES, SEARCH_COMPONENT_ID, SEVERITIES,
} from './bug_suggestion.config';
import {FilterConfig} from './bug_suggestion.types';
import {createAdvanceForm, createBugTemplateForm, createMainForm, setupPortfolioConstructorSubscription} from './bug_suggestion.forms';
import {setupNgOnInitSubscriptions} from './bug_suggestion.subscriptions';
import {reset, updateProductAreaFilter} from './bug_suggestion.utils';
import {search} from './bug_suggestion.search';
import {goToSummary, suggestTitle} from './bug_suggestion.ai';
import {createAndStartAnother, createBug, discard, processBug, updateBugWithSummary} from './bug_suggestion.create';

@Component({
  selector: 'app-bug-suggestion',
  templateUrl: './bug_suggestion.ng.html',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule,
    MatSelectModule, MatInputModule, MatCheckboxModule, MatButtonModule,
    CommonModule, RouterModule, MatSlideToggleModule, MatChipsModule,
    MatRadioModule, MatProgressBarModule, MatProgressSpinnerModule, MatCardModule,
  ],
  styleUrls: ['./bug_suggestion.scss'],
})
export class BugSuggestionToolComponent implements OnInit {
  // ==================== STATE ====================
  templateEnabled = false;
  aiSummaryEnabled = false;
  showPlain = false;
  bugTemplate: any;
  generateBugData: any;
  summaryLines: string[] = [];
  isLoading = false;
  progressValue = 0;
  progressInterval: any;
  workaroundRecommendation = '';
  tabs = ['Exploratory', 'New Feature', 'Regression'];
  bugTypes: string[] = [];
  testingTypes: string[] = [];
  testingOptions: string[] = [];
  verticals: string[] = [];
  selectedIndex = 0;
  descriptionControl = new FormControl<string | null>('');
  form!: FormGroup;
  advanceForm!: FormGroup;
  announcer: LiveAnnouncer = inject(LiveAnnouncer);
  createData: any;
  advanceseverities = ADVANCE_SEVERITIES;
  readonly dialog: MatDialog = inject(MatDialog);
  @ViewChild('select') select!: MatSelect;
  productAreaSearchTermControl = new FormControl<string | null>('');
  reporter = 'chandupavan@google.com';
  readonly reactiveKeywords: WritableSignal<string[]> = signal([
    'angular', 'how-to', 'tutorial', 'accessibility',
  ]);
  duplicates: any[] = [];
  bugId = '420603689';
  isSearchButtonDisabled = false;
  isCreating = false;
  isSuggestingTitle = false;
  productAreas: string[] = [];
  allSearchProductAreas = ALL_SEARCH_PRODUCT_AREAS;
  allProductAreas = ALL_PRODUCT_AREAS;
  assistantComponentId = ASSISTANT_COMPONENT_ID;
  searchComponentId = SEARCH_COMPONENT_ID;
  hotlistIds = HOTLIST_IDS;
  type = BUG_TYPE_OPTIONS;
  priorities = PRIORITIES;
  severities = SEVERITIES;
  filteredProductAreas: string[] = [];
  selectedProductArea: string | null = null;
  productAreaSearchTerm = '';
  filterConfig: {[productArea: string]: FilterConfig} = FILTER_CONFIG;

  // ==================== CONSTRUCTOR ====================
  constructor(
    private fb: FormBuilder,
    private readonly bugAnalyzeService: BugAnalyzeService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = createMainForm(this.fb);
    this.advanceForm = createAdvanceForm(this.fb);
    this.bugTemplate = createBugTemplateForm(this.fb);
    setupPortfolioConstructorSubscription(this);
    this.productAreas = [];
    this.productAreaSearchTerm = '';
    this.filteredProductAreas = [];
    this.descriptionControl.setValue(this.bugTemplate.value.templateDescription);
  }

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    setupNgOnInitSubscriptions(this);
    this.form.addControl('productAreaSearchTerm', this.productAreaSearchTermControl);
    this.form.get('productAreaSearchTerm')?.valueChanges.subscribe((value) => {
      this.productAreaSearchTerm = value || '';
      updateProductAreaFilter(this);
    });
    this.form.addControl('assignee', new FormControl(''));
  }

  // ==================== UI HELPERS ====================
  updateProductAreaFilter(): void { updateProductAreaFilter(this); }
  reset(): void { reset(this); }
  goBack(): void { this.aiSummaryEnabled = false; }

  submit(): void {
    if (this.advanceForm.valid) {
      console.log(this.advanceForm.value);
    } else {
      this.advanceForm.markAllAsTouched();
    }
  }

  onProductAreaChange(event: MatRadioChange): void {
    this.selectedProductArea = event.value;
    this.form.patchValue({product_area: event.value});
  }

  selectProductArea(area: string): void {
    this.form.controls['product_area'].setValue(area);
    if (this.select) { this.select.value = area; this.select.close(); }
    this.productAreaSearchTerm = '';
    updateProductAreaFilter(this);
    this.cdr.markForCheck();
  }

  onOpenedChange(event: boolean): void {
    if (event) { this.productAreaSearchTerm = ''; updateProductAreaFilter(this); }
  }

  editProductArea(): void {
    this.productAreas = [...this.allProductAreas];
    this.filteredProductAreas = [...this.productAreas];
    this.form.controls['product_area'].enable();
  }

  addHoverClass(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) event.target.classList.add('hover-bg');
  }

  removeHoverClass(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) event.target.classList.remove('hover-bg');
  }

  // ==================== ACTION DELEGATES ====================
  search(): void { search(this); }
  goToSummary(): void { goToSummary(this); }
  suggestTitle(): void { suggestTitle(this); }
  createBug(): void { createBug(this); }
  createAndStartAnother(): void { createAndStartAnother(this); }
  discard(): void { discard(this); }
  processBug(id?: string): void { processBug(this, id); }
  updateBugWithSummary(id?: string): void { updateBugWithSummary(this, id); }
}
