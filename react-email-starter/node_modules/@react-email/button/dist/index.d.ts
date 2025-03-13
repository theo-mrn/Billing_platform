import * as React from 'react';

type ButtonProps = Readonly<React.ComponentPropsWithoutRef<"a">>;
declare const Button: React.ForwardRefExoticComponent<Readonly<Omit<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "ref">> & React.RefAttributes<HTMLAnchorElement>>;

export { Button, type ButtonProps };
