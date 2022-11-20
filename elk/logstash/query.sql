select product.id, name, originprice, quantity, originalquantity
      discountRate, discountPrice, issoldout, delivery,
      endtype, validfrom, validuntil, images,
      product.option1, product.option2, product.option3, product.option4, product.option5,
      youtubelink, shopname, ceo, brn, mobn, userId,
      skin, textColor, bgColor,
      product.createdat, product.deletedat,
      `user`.id as user_id, `user`.email as user_email, `user`.userType as user_Type,
      user.nickname as user_nickname, user.phoneNumber as user_phoneNumber, user.zipcode as user_zipcode, user.address
			as user_address, user.addressDetail as user_addressDeatil, user.profileImg as user_profileImg, user.creatorAuthImg as user_creatorAuthImg,
			user.isAuthedCreator as user_isAuthedCreator, user.snsId as user_snsId, 
      user.snsName as user_snsName, user.snsChannel as user_snsChannel, user.followerNumber as user_follwerNumber,
			user.mainContents as user_MainContents, user.introduce as user_introduce, user.bank as user_bank, user.account as user_account,
			user.accountName as user_accountName, user.point as user_point, user.createdAt as user_CreatedAt,
			user.deletedAt as user_deletedAt,
			unix_timestamp(user.updatedat) as user_updatedat,
			unix_timestamp(product.updatedat) as product_updatedat,
			unix_timestamp(GREATEST(user.updatedat, product.updatedat)) as updatedAt
      from product
      left join user on user.id=userId
      where unix_timestamp(GREATEST(user.updatedat, product.updatedat)) > :sql_last_value 
      order by updatedat asc;

