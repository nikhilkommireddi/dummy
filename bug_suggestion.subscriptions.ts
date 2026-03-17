import {updateProductAreaFilter} from './bug_suggestion.utils';

// Mirrors all valueChanges subscriptions from the original ngOnInit
export function setupNgOnInitSubscriptions(ctx: any): void {
  ctx.form.get('portfolio')?.valueChanges.subscribe((value: any) => {
    const productAreaControl = ctx.form.get('product_area');
    const testingTypeControl = ctx.form.get('testing_type');
    const testingOptionsControl = ctx.form.get('testing_options');
    const bugTypeControl = ctx.form.get('bugType');
    const verticalControl = ctx.form.get('vertical');

    testingTypeControl?.reset();
    testingOptionsControl?.reset();
    bugTypeControl?.reset();
    verticalControl?.reset();

    ctx.testingTypes = [];
    ctx.testingOptions = [];
    ctx.bugTypes = [];
    ctx.verticals = [];

    if (value === 'Search') {
      productAreaControl?.enable();
      testingTypeControl?.disable();
      testingOptionsControl?.disable();
      bugTypeControl?.disable();
      verticalControl?.disable();
    } else {
      productAreaControl?.disable();
      testingTypeControl?.disable();
      testingOptionsControl?.disable();
      bugTypeControl?.disable();
      verticalControl?.disable();
    }
  });

  ctx.form.get('product_area')?.valueChanges.subscribe((productArea: any) => {
    const testingTypeControl = ctx.form.get('testing_type');
    const testingOptionsControl = ctx.form.get('testing_options');
    const bugTypeControl = ctx.form.get('bugType');
    const verticalControl = ctx.form.get('vertical');

    testingTypeControl?.reset();
    testingOptionsControl?.reset();
    bugTypeControl?.reset();
    verticalControl?.reset();

    ctx.testingOptions = [];
    ctx.bugTypes = [];
    ctx.verticals = [];

    if (productArea && ctx.filterConfig[productArea]) {
      const config = ctx.filterConfig[productArea];
      ctx.testingTypes = config.testingTypes;
      testingTypeControl?.enable();

      if (config.testingOptions && config.testingOptions.length > 0) {
        ctx.testingOptions = config.testingOptions;
        testingOptionsControl?.enable();
      } else {
        testingOptionsControl?.disable();
      }
      bugTypeControl?.disable();
      verticalControl?.disable();
    } else {
      ctx.testingTypes = [];
      testingTypeControl?.disable();
      testingOptionsControl?.disable();
      bugTypeControl?.disable();
      verticalControl?.disable();
    }
  });

  ctx.form.get('testing_type')?.valueChanges.subscribe((testingType: any) => {
    const productArea = ctx.form.get('product_area')?.value;
    const bugTypeControl = ctx.form.get('bugType');
    const verticalControl = ctx.form.get('vertical');

    bugTypeControl?.reset();
    verticalControl?.reset();
    ctx.bugTypes = [];
    ctx.verticals = [];

    if (productArea && testingType && ctx.filterConfig[productArea]) {
      const config = ctx.filterConfig[productArea];
      if (config.bugTypes[testingType]) {
        ctx.bugTypes = config.bugTypes[testingType];
        bugTypeControl?.enable();
      } else {
        bugTypeControl?.disable();
      }
      verticalControl?.disable();
    } else {
      bugTypeControl?.disable();
      verticalControl?.disable();
    }
  });

  ctx.form.get('bugType')?.valueChanges.subscribe((bugType: any) => {
    const productArea = ctx.form.get('product_area')?.value;
    const testingType = ctx.form.get('testing_type')?.value;
    const verticalControl = ctx.form.get('vertical');

    verticalControl?.reset();
    ctx.verticals = [];

    if (productArea && testingType && bugType && ctx.filterConfig[productArea]) {
      const config = ctx.filterConfig[productArea];
      if (config.verticals[testingType] && config.verticals[testingType][bugType]) {
        const verticalOptions = config.verticals[testingType][bugType];
        if (verticalOptions.length > 0) {
          ctx.verticals = verticalOptions;
          verticalControl?.enable();
        } else {
          verticalControl?.disable();
        }
      } else {
        verticalControl?.disable();
      }
    } else {
      verticalControl?.disable();
    }
  });
}
