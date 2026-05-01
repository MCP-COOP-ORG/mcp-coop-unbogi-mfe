import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('Dummy Test', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Text>Test</Text>);
    expect(getByText('Test')).toBeTruthy();
  });
});
