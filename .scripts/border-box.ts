import boxen from 'boxen'
import chalk from 'chalk'

export const borderBox = (...lines: string[]) => {
  return boxen(chalk.blueBright(lines.join('\n')), {
    title: 'Demo',
    titleAlignment: 'center',
    textAlignment: 'left',
    padding: 1,
    borderStyle: 'bold',
    borderColor: 'blueBright',
  })
}
