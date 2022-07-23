import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes
} from '@discord-nestjs/core';
import { MessageActionRow, Modal, ModalActionRowComponent, TextInputComponent } from 'discord.js';
import { TextInputStyles } from 'discord.js/typings/enums';
import { TestDto } from './test.dto';

@Command({
  name: 'uppercase',
  description: 'Makes a string uppercase'
})
@UsePipes(TransformPipe)
export class TestCommand implements DiscordTransformedCommand<TestDto> {
  private modalId: string;
  private fieldId: string;

  constructor() {
    this.modalId = 'amk';
    this.fieldId = 'amk2';
  }

  async handler(@Payload() { string }: TestDto, { interaction }: TransformedCommandExecutionContext): Promise<void> {
    const modal = new Modal().setTitle(string).setCustomId(this.modalId);

    const commentInputComponent = new TextInputComponent()
      .setLabel('Your string')
      .setStyle(TextInputStyles.SHORT)
      .setValue(string)
      .setCustomId(this.fieldId);

    const rows = [commentInputComponent].map(component =>
      new MessageActionRow<ModalActionRowComponent>().addComponents(component)
    );

    modal.addComponents(...rows);

    await interaction.showModal(modal);
  }
}
