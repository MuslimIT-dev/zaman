<fieldset>
  <legend className="mb-2 block text-sm font-medium">Кто вы?</legend>
  <div className="grid grid-cols-2 gap-3">
    <label className="cursor-pointer rounded-lg border p-3">
      <input type="radio" name="role" value="client" defaultChecked />
      <span className="ml-2">Клиент</span>
    </label>
    <label className="cursor-pointer rounded-lg border p-3">
      <input type="radio" name="role" value="master" />
      <span className="ml-2">Мастер</span>
    </label>
  </div>
</fieldset>