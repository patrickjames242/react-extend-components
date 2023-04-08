type ComponentProps = Record<string, any>;

type Something<
  ComponentPropsGroup extends Record<string, ComponentProps>,
  PropsToIncludeByGroup extends {
    [Key in keyof ComponentPropsGroup]: keyof ComponentPropsGroup[Key];
  }
> = {
  [GroupKey in keyof ComponentPropsGroup]: {
    [PropKey in PropsToIncludeByGroup[GroupKey]]: ComponentPropsGroup[GroupKey][PropKey];
  };
};
