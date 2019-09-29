import React from 'react';
import { mount } from 'enzyme';
import ResizeObserver from '../src';
import { spyElementPrototype } from './utils/domHook';

describe('ResizeObserver', () => {
  let errorSpy;
  let domSpy;
  let mockWidth;
  let mockHeight;

  beforeAll(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => null);
    domSpy = spyElementPrototype(HTMLElement, 'getBoundingClientRect', () => ({
      width: mockWidth,
      height: mockHeight,
    }));
  });

  beforeEach(() => {
    errorSpy.mockReset();
  });

  afterAll(() => {
    errorSpy.mockRestore();
    domSpy.mockRestore();
  });

  describe('children count warning', () => {
    it('without children', () => {
      mount(<ResizeObserver />);

      expect(errorSpy).toHaveBeenCalledWith(
        'Warning: `children` of ResizeObserver is empty. Nothing is in observe.',
      );
    });

    it('multiple children', () => {
      mount(
        <ResizeObserver>
          <div />
          <div />
        </ResizeObserver>,
      );

      expect(errorSpy).toHaveBeenCalledWith(
        'Warning: Find more than one child node with `children` in ResizeObserver. Will only render first one.',
      );
    });
  });

  describe('child ref should support', () => {
    it('function', () => {
      const refFunc = jest.fn();
      mount(
        <ResizeObserver>
          <div ref={refFunc} />
        </ResizeObserver>,
      );

      expect(refFunc).toHaveBeenCalledWith(expect.anything());
    });

    it('object', () => {
      const ref = React.createRef();
      mount(
        <ResizeObserver>
          <div ref={ref} />
        </ResizeObserver>,
      );

      expect(ref.current).toBeTruthy();
    });
  });

  it('onResize', () => {
    const onResize = jest.fn();
    const wrapper = mount(
      <ResizeObserver onResize={onResize}>
        <div />
      </ResizeObserver>,
    );

    wrapper.triggerResize();

    expect(onResize).toHaveBeenCalled();
  });

  it('disabled should not trigger onResize', () => {
    const wrapper = mount(
      <ResizeObserver>
        <div />
      </ResizeObserver>,
    );

    wrapper.setProps({ disabled: true });
    expect(wrapper.findObserver().instance().resizeObserver).toBeFalsy();
  });

  it('unmount to clear', () => {
    const wrapper = mount(
      <ResizeObserver>
        <div />
      </ResizeObserver>,
    );

    const instance = wrapper.findObserver().instance();
    wrapper.unmount();
    expect(instance.resizeObserver).toBeFalsy();
  });
});